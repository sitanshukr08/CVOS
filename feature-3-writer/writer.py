from pathlib import Path
import os
import sys
import json
import hashlib
import chromadb
import re
from groq import Groq
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from repo_paths import CHROMA_DIR, FEATURE_4_EVALUATOR_DIR, add_sys_path

add_sys_path(FEATURE_4_EVALUATOR_DIR)

from evaluator import evaluate_profile

load_dotenv(ROOT_DIR / ".env")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

try:
    chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    collection = chroma_client.get_collection(name="golden_bullets")
except Exception:
    collection = None

def rank_bullets(bullets):
    def score(b):
        has_num = 1 if re.search(r'\d+', b) else 0
        length_score = 1 if 10 <= len(b.split()) <= 25 else 0
        return has_num + length_score
    return sorted(bullets, key=score, reverse=True)

def get_rag_examples(user_data: dict, domain: str) -> str:
    if not collection: return ""
        
    search_text = " ".join([str(e) for e in user_data.get("experience", [])])
    if len(search_text.strip()) < 5:
        search_text = " ".join([str(s) for s in user_data.get("skills", [])])

    domain_map = {"Tech": "INFORMATION-TECHNOLOGY", "Finance": "FINANCE"}
    where_filter = {"domain": domain_map.get(domain)} if domain in domain_map else None

    try:
        results = collection.query(
            query_texts=[search_text] if search_text.strip() else ["software developer metrics"],
            n_results=15,
            where=where_filter
        )
        
        if not results or not results.get('documents') or not results['documents'][0]:
            return ""

        bullets = results['documents'][0]
        metadatas = results['metadatas'][0]
        
        dataset_bullets = []
        learned_bullets = []
        
        for b, m in zip(bullets, metadatas):
            if m and m.get("source") == "cvos-self-learned":
                learned_bullets.append(b)
            else:
                dataset_bullets.append(b)
                
        dataset_bullets = rank_bullets(dataset_bullets)
        learned_bullets = rank_bullets(learned_bullets)
                
        final_mix = dataset_bullets[:2] + learned_bullets[:1]
        if len(final_mix) < 3: final_mix = bullets[:3] 
        
        rag_prompt = "ELITE STYLISTIC INSPIRATION:\n"
        for b in final_mix: rag_prompt += f"- {b}\n"
        return rag_prompt
    except Exception as e:
        print(f"RAG Fetch Warning: {e}")
        return ""

def validate_schema(data, fallback):
    """Deep structural validation to prevent LaTeX/PDF crashes"""
    if not isinstance(data, dict): return fallback
    if not isinstance(data.get("profile"), str): data["profile"] = fallback.get("profile", "")
    
    if not isinstance(data.get("skills"), list): 
        data["skills"] = fallback.get("skills", [])
    
    if not isinstance(data.get("education"), list): 
        data["education"] = fallback.get("education", [])
        
    if not isinstance(data.get("experience"), list): 
        data["experience"] = fallback.get("experience", [])
    else:
        # Enforce bullet array exists for every job
        for exp in data["experience"]:
            if not isinstance(exp, dict): continue
            if "bullets" not in exp or not isinstance(exp["bullets"], list):
                exp["bullets"] = []
                
    return data

def enhance_user_data(raw_data: dict, github_profile_readme: str, domain: str = "General", feedback_issues: list = None, original_data: dict = None) -> dict:
    feedback_prompt = "CRITICAL FEEDBACK TO FIX:\n" + "\n".join([f"- {i['msg']}" for i in feedback_issues]) if feedback_issues else ""
    rag_context = get_rag_examples(raw_data, domain)

    prompt = f"""
    You are a precise Technical Resume Formatting System specializing in {domain}.

    ORIGINAL TRUTH DATA:
    {json.dumps(original_data if original_data else raw_data, indent=2)}

    CURRENT DRAFT:
    {json.dumps(raw_data, indent=2)}

    {rag_context}
    
    {feedback_prompt}

    RULES:
    1. HALLUCINATION GUARD & FAILURE BEHAVIOR: Only use facts present in Truth Data. Do not invent metrics or tools. Return empty arrays if data is missing.
    2. BULLET PATTERN & LENGTH: 10-25 words. [Strong Verb] + [Specific Tool/Technology] + [Outcome or Scale].
    3. EXPLICIT TOOLS ONLY: BANNED TERMS include "various tools", "modern frameworks", "backend technologies", "software". 
    4. CROSS-BULLET DIVERSITY: Never use the same action verb more than once across the entire resume.
    5. SENIORITY CALIBRATION:
       - <2 yrs experience -> "Motivated", "Aspiring", "Results-driven"
       - 2-5 yrs experience -> "Experienced", "Skilled"
       - 5+ yrs -> "Senior", "Lead"
    6. PROFILE FORMULA: [Seniority-appropriate adjective] [Target Role] specializing in [Top 2-3 skills]. Do NOT list specific past companies, internships, or timelines in the profile. Keep it strictly focused on capabilities.
    7. MISSING DATA: Output "" for strings and [] for arrays.

    OUTPUT EXACTLY THIS JSON:
    {{
      "profile": "Aspiring ML Engineer specializing in Python and TensorFlow.",
      "skills": [{{"category": "Core", "list": "Python, FastAPI, TensorFlow"}}],
      "education": [{{"institution": "", "degree": "", "graduation_date": "", "gpa": ""}}],
      "experience": [{{"company": "", "role": "", "date_range": "", "bullets": [""]}}]
    }}
    """
    try:
        res = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}], 
            model="llama-3.3-70b-versatile", 
            temperature=0.1, 
            response_format={"type": "json_object"}
        )
        parsed = json.loads(res.choices[0].message.content)
        return validate_schema(parsed, raw_data)
    except Exception as e:
        print(f"LLM Enhancement Error: {e}")
        return raw_data

def generate_project_bullets(repo_data: dict) -> list:
    prompt = f"""Write 3 ATS-optimized resume bullet points for this project.
    Constraints: 10-25 words per bullet. Name exact technologies. Do not repeat verbs.
    Repo: {repo_data.get('name')} | Language: {repo_data.get('language')} | Desc: {repo_data.get('description')}
    Output strict JSON: {{"bullets": ["...", "...", "..."]}}"""
    try:
        res = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}], 
            model="llama-3.1-8b-instant", 
            temperature=0.2, 
            response_format={"type": "json_object"}
        )
        return json.loads(res.choices[0].message.content).get("bullets", [])
    except Exception as e: 
        print(f"Project Bullet LLM Error: {e}")
        return [
            f"Developed core architecture using {repo_data.get('language', 'industry-standard tools')}.",
            "Maintained version control and implemented scalable features.",
            "Optimized codebase for readability and long-term performance."
        ]

def recursive_enhance(raw_data: dict, github_profile_readme: str, domain: str = "General"):
    current_data = raw_data
    issues = []
    final_score = 0
    max_iterations = 3
    
    print("Initializing Convergence Loop...")
    for iteration in range(max_iterations):
        print(f"Enhancement Pass {iteration + 1}...")
        
        enhanced = enhance_user_data(current_data, github_profile_readme, domain, issues, original_data=raw_data)
        eval_result = evaluate_profile(enhanced, original_state=raw_data)
        
        new_score = eval_result["global_score"]
        conf = eval_result["confidence"]
        print(f"Score: {new_score}/100 | Confidence: {conf*100}%")
        
        if new_score >= 95 or (new_score <= final_score and iteration > 0):
            print("System Converged.")
            
            if conf >= 0.90 and new_score >= 95 and collection:
                if collection.count() < 5000: 
                    print("High Confidence Output. Deduplicating and caching to long-term memory...")
                    for exp in enhanced.get("experience", []):
                        for bullet in exp.get("bullets", []):
                            if 10 < len(bullet.split()) < 30: 
                                bullet_hash = hashlib.md5(bullet.encode('utf-8')).hexdigest()
                                collection.upsert( 
                                    documents=[bullet],
                                    metadatas=[{"domain": domain, "source": "cvos-self-learned"}],
                                    ids=[bullet_hash]
                                )
            return enhanced, new_score
            
        final_score = new_score
        issues = eval_result["issues"]
        current_data = enhanced 

    return current_data, final_score