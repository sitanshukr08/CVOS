import os
import json
from groq import Groq
from dotenv import load_dotenv
from evaluator import evaluate_profile

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_project_bullets(repo_data: dict) -> list:
    prompt = f"""
    Write 3 ATS-optimized resume bullet points for this project.
    
    STRICT CONSTRAINTS:
    1. Maximum 20 words per bullet.
    2. MUST include at least one hard skill/tool.
    3. BANNED WORDS: "Responsible for", "Tasked with", "Helped", "Worked on".
    4. Start with a strong action verb.
    
    Repository Data:
    - Name: {repo_data.get('name')}
    - Language: {repo_data.get('language')}
    - Description: {repo_data.get('description')}
    - README: {repo_data.get('readme')}
    
    Output strictly JSON: {{"bullets": ["bullet 1", "bullet 2", "bullet 3"]}}
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content).get("bullets", [])
    except:
        return []

def enhance_user_data(raw_data: dict, github_profile_readme: str, domain: str = "General", feedback_issues: list = None) -> dict:
    feedback_prompt = ""
    if feedback_issues:
        feedback_prompt = "CRITICAL FEEDBACK TO FIX IN THIS ITERATION:\n" + "\n".join([f"- {i['msg']}" for i in feedback_issues])

    prompt = f"""
    You are an elite Executive Resume Formatting System specializing in the {domain} industry.
    You also act as an AUTO-IMPROVEMENT ENGINE.

    RAW USER DATA:
    {json.dumps(raw_data, indent=2)}
    
    GITHUB PROFILE README:
    {github_profile_readme}

    {feedback_prompt}

    CRITICAL RULES:
    1. AUTO-FIX WEAK VERBS: If raw data uses "worked on", "helped", or "did", REWRITE them using "Engineered", "Architected", "Spearheaded", "Analyzed".
    2. AUTO-SUGGEST SKILLS: If skills are missing, infer them from their project context or education.
    3. MISSING FIELDS: Leave as "". DO NOT write "Not Provided" or "N/A".
    4. BANNED PHRASES: "Detail-driven student", "passion for", "currently pursuing", "Not Provided".
    5. PROFILE FORMULA: [Strong Adjective] [Role/Degree] specializing in [Top 2 Technical Skills]. Proven ability in [Specific Fact], eager to leverage analytical foundation for high-impact roles.
    6. TECHNICAL DEPTH: Inject specific tools, frameworks, and metrics into bullets if implied.

    OUTPUT EXACTLY THIS JSON FORMAT:
    {{
      "profile": "",
      "skills": [{{"category": "", "list": ""}}],
      "education": [{{"institution": "", "degree": "", "graduation_date": "", "gpa": ""}}],
      "experience": [{{"company": "", "role": "", "date_range": "", "bullets": [""]}}]
    }}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile", 
            temperature=0.2, 
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        safe_profile = f"Professional candidate with background in {domain}." if domain else "Professional candidate."
        return {
            "profile": safe_profile,
            "skills": [{"category": "Core Skills", "list": "Refer to experience"}],
            "education": raw_data.get("education", []),
            "experience": raw_data.get("experience", [])
        }

def recursive_enhance(raw_data: dict, github_profile_readme: str, domain: str = "General"):
    current_data = raw_data
    issues = []
    final_score = 100
    
    for iteration in range(2):
        enhanced = enhance_user_data(current_data, github_profile_readme, domain, issues)
        score, new_issues = evaluate_profile(enhanced)
        final_score = score
        
        if score >= 85 or not new_issues:
            return enhanced, final_score
            
        issues = new_issues
        current_data = enhanced 

    return current_data, final_score