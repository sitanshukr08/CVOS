from pathlib import Path
import os
import sys
import requests
import base64
from datetime import datetime, timezone
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

load_dotenv(ROOT_DIR / ".env")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "Authorization": f"Bearer {GITHUB_TOKEN}" if GITHUB_TOKEN else ""
}

def get_repo_readme(owner: str, repo: str):
    """Fetches and decodes the README.md of a repository."""
    url = f"https://api.github.com/repos/{owner}/{repo}/readme"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        readme_content = base64.b64decode(data["content"]).decode('utf-8', errors='ignore')
        return readme_content[:2000]
    return ""

def calculate_project_score(repo, readme_content):
    """Advanced reasoning algorithm with capped validation and strict edge-case penalties."""
    score = 0
    
    if not readme_content or len(readme_content) < 50:
        score -= 50 
        
    if repo.get("size", 0) < 10:
        score -= 100
        
    stars = repo.get("stargazers_count") or 0
    forks = repo.get("forks_count") or 0
    score += min(stars * 2, 20)
    score += min(forks * 2, 10) 
    
    if repo.get("description"): 
        score += 10
    if readme_content:
        if len(readme_content) > 1000:
            score += 25
        elif len(readme_content) > 200:
            score += 10
        
    try:
        pushed_at = datetime.strptime(repo.get("pushed_at", ""), "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
        days_ago = (datetime.now(timezone.utc) - pushed_at).days
        recency_bonus = max(0, 20 - (days_ago / 15))
        score += recency_bonus
    except Exception:
        pass 
    
    language = str(repo.get("language", "")).lower()
    high_value = ['python', 'c++', 'java', 'go', 'rust', 'typescript', 'c#', 'javascript']
    low_value = ['html', 'css', 'jupyter notebook']
    if language in high_value: score += 10
    elif language in low_value: score -= 15 
        
    name_and_desc = (str(repo.get("name", "")) + " " + str(repo.get("description", ""))).lower()
    red_flags = ['tutorial', 'learning', '100-days', 'homework', 'assignment', 'test', 'demo', 'dotfiles', 'hello-world']
    for flag in red_flags:
        if flag in name_and_desc:
            score -= 100 
            
    return score

def get_best_repos(username: str, limit: int = 3):
    url = f"https://api.github.com/users/{username}/repos"
    params = {"per_page": 100, "sort": "updated"} 
    response = requests.get(url, headers=HEADERS, params=params)
    
    if response.status_code != 200:
        return []

    repos = response.json()
    
    valid_repos = [r for r in repos if not r.get("fork") and not r.get("disabled")]
    
    repo_data = []
    for repo in valid_repos:
        readme = get_repo_readme(username, repo["name"])
        score = calculate_project_score(repo, readme)
        
        if score > -10:
            repo_data.append({
                "name": repo["name"],
                "description": repo["description"],
                "url": repo["html_url"],
                "language": repo["language"] or "Unknown",
                "stars": repo.get("stargazers_count", 0),
                "score": score,
                "readme": readme
            })
            
    best_repos = sorted(repo_data, key=lambda x: x['score'], reverse=True)[:limit]
    return best_repos
