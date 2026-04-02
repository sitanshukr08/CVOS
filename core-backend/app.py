from pathlib import Path
import sys

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Any
import asyncio

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

app = FastAPI()

class ResumeRequest(BaseModel):
    name: str
    email: str
    github_username: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    skills: Any = []      
    education: Any = []   
    experience: Any = []  
    inferred_domain: Optional[str] = None

@app.post("/generate-resume")
async def create_resume(request: ResumeRequest):
    if not request.name or not request.email:
        raise HTTPException(status_code=400, detail="Name and Email are mandatory")

    try:
        gh_user = request.github_username
        if gh_user and str(gh_user).lower() in ['none', 'null', 'n/a', '']:
            gh_user = None

        profile_readme = get_repo_readme(gh_user, gh_user) if gh_user else ""
        
        enhanced_data, final_score = await asyncio.to_thread(
            recursive_enhance, request.model_dump(), profile_readme, request.inferred_domain
        )

        if final_score < 40:
            raise HTTPException(status_code=400, detail=f"Final processed quality score too low ({final_score}/100). Please provide more technical depth, metrics, or specifics.")

        if not isinstance(enhanced_data.get("skills"), list):
            enhanced_data["skills"] = []
        if not isinstance(enhanced_data.get("experience"), list):
            enhanced_data["experience"] = []
        if not isinstance(enhanced_data.get("education"), list):
            enhanced_data["education"] = []

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

        user_data = {
            "name": request.name,
            "email": request.email,
            "github": gh_user,
            "phone": request.phone,
            "linkedin": request.linkedin,
            "profile": enhanced_data.get("profile", ""),
            "education": enhanced_data.get("education", request.education),
            "experience": enhanced_data.get("experience", request.experience),
            "skills": enhanced_data.get("skills", []), 
            "projects": projects_data
        }

        safe_name = request.name.replace(' ', '_')
        output_stem = REPO_ROOT / f"{safe_name}_Resume"
        
        pdf_path = await asyncio.to_thread(generate_pdf, user_data, str(output_stem))
        
        if not pdf_path.exists():
            raise HTTPException(status_code=500, detail="PDF generation failed")

        return FileResponse(str(pdf_path), media_type="application/pdf", filename=f"{safe_name}_Resume.pdf")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
