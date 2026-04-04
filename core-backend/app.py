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

        gh_user = request.current_state.get("githubUsername") or request.current_state.get("github_username")
        
        if not gh_user and request.user_input:
            gh_match = re.search(r'github(?:\s*is|:|\s*username\s*is)?\s+([a-zA-Z0-9-]+)', request.user_input, re.IGNORECASE)
            if gh_match:
                gh_user = gh_match.group(1).strip()

        gh_repos_context = "User has not provided a GitHub username yet."
        if gh_user:
            try:
                repos = await asyncio.to_thread(get_best_repos, gh_user, limit=3)
                if repos:
                    repo_details = [f"{r.get('name')} (Desc: {r.get('description', 'None')})" for r in repos]
                    gh_repos_context = f"Successfully fetched GitHub repos for {gh_user}: " + " | ".join(repo_details)
                else:
                    gh_repos_context = f"Found GitHub user {gh_user} but no public repositories."
            except Exception:
                gh_repos_context = f"Tried to fetch GitHub for {gh_user} but the API failed."

        drafter_prompt = f"""
        You are the Brain and Overviewer of the CVOS Resume System.
        CURRENT FORM STATE: {json.dumps(compressed_state)}
        SYSTEM DATA: Score: {current_score}/100. GitHub Data: {gh_repos_context}
        
        CRITICAL INSTRUCTION 1: If the user asks you to improve, rewrite, or add something, you MUST generate the actual text and put it inside `suggested_state_updates`. Valid keys: "name", "email", "phone", "linkedin", "githubUsername", "targetRole", "headline", "skillsSnapshot", "experienceDetails", "educationDetails", "featuredProjectsText".
        CRITICAL INSTRUCTION 2: IF the user JUST asks to "preview", "generate", or "update the PDF", DO NOT modify any text fields. Leave `suggested_state_updates` completely EMPTY {{}}.
        
        ANTI-LOOP RULE: Do NOT include keys that are not changing.
        
        OUTPUT STRICT JSON EXACTLY MATCHING THIS SKELETON:
        {{
            "suggested_state_updates": {{}},
            "reply_to_user": "Your reply here.",
            "action": "none"
        }}
        """
        
        messages_1 = [{"role": "system", "content": drafter_prompt}] + recent_history
        if request.user_input:
            messages_1.append({"role": "user", "content": request.user_input})

        res_1 = await asyncio.to_thread(
            client.chat.completions.create,
            messages=messages_1,
            model="llama-3.1-8b-instant",
            temperature=0.2, 
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        agent_1_draft = json.loads(res_1.choices[0].message.content)

        draft_updates_json = json.dumps(agent_1_draft.get('suggested_state_updates', {}))
        
        critic_prompt = f"""
        You are an Elite Senior Technical Recruiter overseeing the CVOS AI system.
        
        USER'S LATEST MESSAGE: "{request.user_input}"
        ASSISTANT'S DRAFT REPLY: "{agent_1_draft.get('reply_to_user', '')}"
        ASSISTANT'S DRAFT UPDATES: {draft_updates_json}
        
        SYSTEM CONTEXT: 
        - Resume Score: {current_score}/100
        - GitHub Data: {gh_repos_context}

        YOUR JOB:
        1. AGENTIC ACTION: If the user asks to "generate", "preview", "create", or "update the pdf":
           - Set `"action": "trigger_generation"`.
           - Set `"suggested_state_updates": {{}}` (EMPTY!). Do not rewrite the resume just to preview it.
           - Tell them: "I am generating your resume right now! You can view and download it in the 'Final Output' tab."
        2. VERIFY UPDATES: If the user explicitly asked to change text (skills, summary, etc), ensure the text is actually written in `suggested_state_updates`.
        
        CRITICAL OUTPUT RULE: Keep the `reply_to_user` conversational, short, and NEVER output raw JSON, newline characters (\\n), or the full resume in the chat.
        
        OUTPUT STRICT JSON EXACTLY MATCHING THIS SKELETON:
        {{
            "suggested_state_updates": {{}},
            "reply_to_user": "Your short conversational reply.",
            "action": "none"
        }}
        """

        res_2 = await asyncio.to_thread(
            client.chat.completions.create,
            messages=[{"role": "system", "content": critic_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1, 
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        
        final_output = json.loads(res_2.choices[0].message.content)
        
        if gh_user and "githubUsername" not in final_output.get("suggested_state_updates", {}):
            if "suggested_state_updates" not in final_output:
                final_output["suggested_state_updates"] = {}
            # Only inject github if it wasn't there to avoid breaking empty updates
            if not request.current_state.get("githubUsername"):
                final_output["suggested_state_updates"]["githubUsername"] = gh_user
            
        return final_output

    except Exception as e:
        print(f"Chat API Error: {e}")
        return {
            "suggested_state_updates": {},
            "reply_to_user": f"I encountered an internal error: {str(e)}",
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
            for repo in repos:
                bullets = await asyncio.to_thread(generate_project_bullets, repo)
                projects_data.append({
                    "name": repo["name"],
                    "language": repo["language"],
                    "url": repo["url"],
                    "bullets": bullets
                })

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