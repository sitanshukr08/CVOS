import os
import shutil
import tempfile
import asyncio
import json
import re
from pathlib import Path
import sys
from typing import Dict, Any, List

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from repo_paths import (
    FEATURE_2_GITHUB_FETCHER_DIR,
    FEATURE_3_WRITER_DIR,
    FEATURE_5_PDF_GENERATOR_DIR,
    ROOT_DIR as REPO_ROOT,
    add_sys_path,
)

add_sys_path(FEATURE_2_GITHUB_FETCHER_DIR, FEATURE_3_WRITER_DIR, FEATURE_5_PDF_GENERATOR_DIR)

from github_fetcher import get_best_repos, get_repo_readme
from writer import generate_project_bullets, recursive_enhance
from pdf_generator import generate_pdf

app = FastAPI(title="CVOS Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeRequest(BaseModel):
    user_data: Dict[str, Any]

class ChatRequest(BaseModel):
    user_input: str
    history: List[Dict[str, str]]
    current_state: Dict[str, Any]

def cleanup_temp_dir(dir_path: str):
    shutil.rmtree(dir_path, ignore_errors=True)

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        compressed_state = {k: v for k, v in request.current_state.items() if v}
        recent_history = request.history[-6:] if len(request.history) > 6 else request.history
        
        try:
            from evaluator import evaluate_profile
            eval_result = await asyncio.to_thread(evaluate_profile, request.current_state)
            current_score = eval_result.get("global_score", 0)
        except Exception:
            current_score = "Unknown"

        required_fields = [
            ("targetRole", "Target Job Role"),
            ("name", "Full Name"),
            ("email", "Email Address"),
            ("githubUsername", "GitHub Username")
        ]
        
        missing_fields = [desc for key, desc in required_fields if not compressed_state.get(key) or len(str(compressed_state.get(key)).strip()) < 2]
        
        if missing_fields:
            next_step_directive = f"CRITICAL DIRECTIVE: Ask the user to provide: '{missing_fields[0]}'."
        else:
            next_step_directive = "Basic info is complete. Tell them you are ready to auto-generate sections or review specific parts."

        gh_user = request.current_state.get("githubUsername") or request.current_state.get("github_username")
        
        if not gh_user and request.user_input:
            gh_match = re.search(r'github(?:\s*is|:|\s*username\s*is)?\s+([a-zA-Z0-9-]+)', request.user_input, re.IGNORECASE)
            if gh_match:
                gh_user = gh_match.group(1).strip()

        gh_repos_context = "No GitHub data available."
        if gh_user:
            try:
                repos = await asyncio.to_thread(get_best_repos, gh_user, limit=5)
                if repos:
                    repo_details = []
                    for r in repos:
                        langs = ", ".join([f"{k}" for k,v in r.get('languages', {}).items()])
                        deps = r.get('dependencies', 'None')
                        repo_details.append(f"[{r.get('name')} | Langs: {langs} | Deps: {deps}]")
                    gh_repos_context = f"Deep Scanned GitHub Data for {gh_user}:\n" + "\n".join(repo_details)
                else:
                    gh_repos_context = f"No public repositories found for {gh_user}."
            except Exception:
                pass

        drafter_prompt = f"""
        You are the proactive Lead Resume Engineer for CVOS. You DRIVE the conversation step-by-step.
        CURRENT FORM STATE: {json.dumps(compressed_state)}
        SYSTEM DATA: GitHub Data: {gh_repos_context}
        
        {next_step_directive}
        
        ANTI-LAZY DIRECTIVES (CRITICAL):
        1. IF YOU SAY YOU DID IT, YOU MUST OUTPUT THE DATA: If you say "I wrote your profile summary", you MUST write the actual summary text inside `suggested_state_updates["headline"]`. DO NOT leave it empty.
        2. AUTOPILOT SUMMARY: If the user asks for a profile summary, DO NOT ask for "more background". Instantly read the SYSTEM DATA, write a punchy 2-sentence technical summary, put it in `suggested_state_updates["headline"]`, and print it in the chat.
        3. SKILL FILTERING: If the user asks to remove skills (e.g., "remove yt-dlp"), you MUST output the newly filtered list of skills in `suggested_state_updates["skillsSnapshot"]`.
        
        OUTPUT STRICT JSON EXACTLY MATCHING THIS SKELETON:
        {{
            "suggested_state_updates": {{"headline": "...", "skillsSnapshot": "..."}},
            "reply_to_user": "Your reply here.",
            "action": "none"
        }}
        """
        
        messages_1 = [{"role": "system", "content": drafter_prompt}] + recent_history
        if request.user_input:
            messages_1.append({"role": "user", "content": request.user_input})

        try:
            res_1 = await asyncio.to_thread(
                client.chat.completions.create,
                messages=messages_1,
                model="llama-3.1-8b-instant",
                temperature=0.2, 
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            agent_1_draft = json.loads(res_1.choices[0].message.content)
        except Exception:
            agent_1_draft = {"suggested_state_updates": {}, "reply_to_user": "Processing...", "action": "none"}

        draft_updates_json = json.dumps(agent_1_draft.get('suggested_state_updates', {}))
        
        critic_prompt = f"""
        You are an Elite Senior Technical Recruiter overseeing the CVOS AI system.
        
        USER'S LATEST MESSAGE: "{request.user_input}"
        ASSISTANT'S DRAFT REPLY: "{agent_1_draft.get('reply_to_user', '')}"
        ASSISTANT'S DRAFT UPDATES: {draft_updates_json}
        
        SYSTEM CONTEXT: GitHub Data: {gh_repos_context}

        YOUR JOB:
        1. PUNISH LAZINESS: If the Drafter's reply says "I created a summary" but `suggested_state_updates` does NOT contain "headline", you MUST write the summary yourself using the GitHub Data and put it in `suggested_state_updates["headline"]`.
        2. AGENTIC ACTION: If the user asks to "generate", "preview", or "create the pdf":
           - Set `"action": "trigger_generation"`.
           - Set `"suggested_state_updates": {{}}` ONLY if no other text updates were requested in the same message. 
        3. ANTI-FLUFF FORMAT: "[Seniority] [Role] with experience building [Types of Systems/Projects] using [Core Technologies]."

        CRITICAL OUTPUT RULE: Keep the `reply_to_user` short. NEVER output raw JSON in the chat.
        
        OUTPUT STRICT JSON EXACTLY MATCHING THIS SKELETON:
        {{
            "suggested_state_updates": {{"key": "value"}},
            "reply_to_user": "Your short conversational proactive reply.",
            "action": "none"
        }}
        """

        try:
            res_2 = await asyncio.to_thread(
                client.chat.completions.create,
                messages=[{"role": "system", "content": critic_prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.1, 
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            final_output = json.loads(res_2.choices[0].message.content)
        except Exception:
            final_output = {
                "suggested_state_updates": {},
                "reply_to_user": "I'm processing a high volume of data. Please try sending that again.",
                "action": "none"
            }
        
        sanitized_updates = {}
        if isinstance(final_output.get("suggested_state_updates"), dict):
            for k, v in final_output["suggested_state_updates"].items():
                if isinstance(v, (str, int, float, bool)):
                    sanitized_updates[k] = str(v)
                elif isinstance(v, list):
                    sanitized_updates[k] = ", ".join([str(i) for i in v])
        
        final_output["suggested_state_updates"] = sanitized_updates
        final_output["reply_to_user"] = str(final_output.get("reply_to_user", "I processed that."))
        
        if final_output.get("action") not in ["none", "trigger_generation"]:
            final_output["action"] = "none"

        if gh_user and "githubUsername" not in final_output["suggested_state_updates"]:
            if not request.current_state.get("githubUsername"):
                final_output["suggested_state_updates"]["githubUsername"] = gh_user
            
        return final_output

    except Exception as e:
        print(f"Chat API Absolute Error: {e}")
        return {
            "suggested_state_updates": {},
            "reply_to_user": "The connection timed out. Please try sending your message again.",
            "action": "none"
        }

@app.get("/api/github-repos/{username}")
async def fetch_github_repos(username: str):
    try:
        repos = await asyncio.to_thread(get_best_repos, username, limit=6)
        return {"projects": repos}
    except Exception as e:
        print(f"GitHub Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-resume")
async def create_resume(request: ResumeRequest, background_tasks: BackgroundTasks):
    user_data = request.user_data
    
    name = user_data.get("name")
    email = user_data.get("email")
    
    if not name or not email:
        raise HTTPException(status_code=400, detail="Name and Email are mandatory")

    gh_user = user_data.get("github_username")
    if gh_user and str(gh_user).lower() in ['none', 'null', 'n/a', '']:
        gh_user = None

    try:
        profile_readme = get_repo_readme(gh_user, gh_user) if gh_user else ""
        
        enhanced_data, final_score = await asyncio.to_thread(
            recursive_enhance, user_data, profile_readme, user_data.get("inferred_domain", "General")
        )

        if final_score < 40:
            raise HTTPException(status_code=400, detail=f"Final processed quality score too low ({final_score}/100). Please provide more technical depth.")

        for key in ["skills", "experience", "education"]:
            if not isinstance(enhanced_data.get(key), list):
                enhanced_data[key] = []

        projects_data = []
        if gh_user:
            repos = await asyncio.to_thread(get_best_repos, gh_user, limit=3)
            
            # --- MASSIVE OPTIMIZATION APPLIED HERE ---
            # Concurrently generate project bullets instead of sequentially looping
            async def process_repo(repo):
                bullets = await asyncio.to_thread(generate_project_bullets, repo)
                return {
                    "name": repo["name"],
                    "language": repo["language"],
                    "url": repo["url"],
                    "bullets": bullets
                }
            
            projects_data = await asyncio.gather(*(process_repo(repo) for repo in repos))

        for skill in enhanced_data.get("skills", []):
            if isinstance(skill.get("list"), list):
                skill["list"] = ", ".join(str(s) for s in skill["list"])

        final_user_data = {
            "name": name,
            "email": email,
            "github": gh_user,
            "phone": user_data.get("phone"),
            "linkedin": user_data.get("linkedin"),
            "profile": enhanced_data.get("profile", ""),
            "education": enhanced_data.get("education", []),
            "experience": enhanced_data.get("experience", []),
            "skills": enhanced_data.get("skills", []), 
            "projects": projects_data
        }

        safe_name = name.replace(' ', '_')
        
        tmpdir = tempfile.mkdtemp()
        output_stem = os.path.join(tmpdir, f"{safe_name}_Resume")
        
        pdf_path_result = await asyncio.to_thread(generate_pdf, final_user_data, output_stem)
        
        pdf_path = Path(pdf_path_result) if isinstance(pdf_path_result, str) else pdf_path_result
        if pdf_path is None or not Path(pdf_path).exists():
            fallback_path = Path(f"{output_stem}.pdf")
            if fallback_path.exists():
                pdf_path = fallback_path
            else:
                raise HTTPException(status_code=500, detail="PDF generation failed. LaTeX compiler error.")

        background_tasks.add_task(cleanup_temp_dir, tmpdir)

        return FileResponse(
            str(pdf_path), 
            media_type="application/pdf", 
            filename=f"{safe_name}_Resume.pdf"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)