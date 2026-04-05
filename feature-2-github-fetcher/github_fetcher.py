from pathlib import Path
import os
import sys
import requests
import base64
import json
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
    url = f"https://api.github.com/repos/{owner}/{repo}/readme"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        return base64.b64decode(data["content"]).decode('utf-8', errors='ignore')[:2000]
    return ""

def get_repo_languages(owner: str, repo: str):
    url = f"https://api.github.com/repos/{owner}/{repo}/languages"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        langs = response.json()
        total_bytes = sum(langs.values())
        if total_bytes > 0:
            return {k: f"{round((v/total_bytes)*100)}%" for k, v in langs.items()}
    return {}

def get_repo_dependencies(owner: str, repo: str):
    """Deep scans the root directory to read actual code dependencies."""
    url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    response = requests.get(url, headers=HEADERS)
    deps_text = ""
    
    if response.status_code == 200:
        contents = response.json()
        file_names = [f["name"] for f in contents if isinstance(f, dict)]
        
        # Check Node.js
        if "package.json" in file_names:
            res = requests.get(f"https://api.github.com/repos/{owner}/{repo}/contents/package.json", headers=HEADERS)
            if res.status_code == 200:
                try:
                    pkg = json.loads(base64.b64decode(res.json()["content"]).decode('utf-8'))
                    deps = list(pkg.get("dependencies", {}).keys()) + list(pkg.get("devDependencies", {}).keys())
                    if deps: deps_text += f"Node Packages: {', '.join(deps[:15])}. "
                except: pass
                
        # Check Python
        if "requirements.txt" in file_names:
            res = requests.get(f"https://api.github.com/repos/{owner}/{repo}/contents/requirements.txt", headers=HEADERS)
            if res.status_code == 200:
                reqs = base64.b64decode(res.json()["content"]).decode('utf-8').split('\n')
                clean_reqs = [r.split('==')[0].strip() for r in reqs if r.strip() and not r.startswith('#')]
                if clean_reqs: deps_text += f"Python Libs: {', '.join(clean_reqs[:15])}. "
                
        # Check Go / Java
        if "go.mod" in file_names: deps_text += "Uses Go Modules. "
        if "pom.xml" in file_names: deps_text += "Uses Maven/Java dependencies. "
        
    return deps_text

def calculate_project_score(repo, readme_content):
    score = 0
    if not readme_content or len(readme_content) < 50: score -= 50 
    if repo.get("size", 0) < 10: score -= 100
        
    score += min((repo.get("stargazers_count") or 0) * 2, 20)
    if repo.get("description"): score += 10
    if readme_content and len(readme_content) > 200: score += 10
        
    language = str(repo.get("language", "")).lower()
    if language in ['python', 'c++', 'java', 'go', 'rust', 'typescript', 'c#', 'javascript']: score += 10
    elif language in ['html', 'css', 'jupyter notebook']: score -= 15 
        
    red_flags = ['tutorial', 'learning', '100-days', 'homework', 'test', 'hello-world']
    name_and_desc = (str(repo.get("name", "")) + " " + str(repo.get("description", ""))).lower()
    for flag in red_flags:
        if flag in name_and_desc: score -= 100 
            
    return score

def get_best_repos(username: str, limit: int = 3):
    url = f"https://api.github.com/users/{username}/repos"
    params = {"per_page": 100, "sort": "updated"} 
    response = requests.get(url, headers=HEADERS, params=params)
    
    if response.status_code != 200: return []
    valid_repos = [r for r in response.json() if not r.get("fork") and not r.get("disabled")]
    
    repo_data = []
    for repo in valid_repos:
        readme = get_repo_readme(username, repo["name"])
        score = calculate_project_score(repo, readme)
        
        if score > -20:
            repo_data.append({
                "name": repo["name"],
                "description": repo["description"],
                "url": repo["html_url"],
                "language": repo["language"] or "Unknown",
                "score": score,
                "readme": readme
            })
            
    best_repos = sorted(repo_data, key=lambda x: x['score'], reverse=True)[:limit]
    
    for repo in best_repos:
        repo["languages"] = get_repo_languages(username, repo["name"])
        repo["dependencies"] = get_repo_dependencies(username, repo["name"])
        
    return best_repos