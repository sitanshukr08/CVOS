import re
import json
from collections import Counter

KNOWN_TOOLS = {
    "python", "fastapi", "sql", "react", "aws", "docker", "api", "java", "c++", 
    "node", "ai", "machine learning", "linux", "git", "tensorflow", "pytorch", 
    "keras", "pandas", "numpy", "excel", "bloomberg", "powerpoint", "c#", "ruby", 
    "go", "rust", "kubernetes", "azure", "gcp", "mongodb", "postgresql", "mysql", 
    "redis", "javascript", "typescript", "html", "css", "django", "flask", "spring"
}

def get_hybrid_domain(text_corpus):
    text_corpus = str(text_corpus).lower()
    tech_keywords = ["bca", "btech", "cs", "computer", "software", "developer", "github", "api", "python", "fastapi", "sql", "tensorflow", "backend", "frontend"]
    fin_keywords = ["finance", "accounting", "bank", "investment", "commerce", "excel", "equity", "liquidity", "valuation", "bsc"]
    
    tech_score = sum(text_corpus.count(k) for k in tech_keywords)
    fin_score = sum(text_corpus.count(k) for k in fin_keywords)
    total = tech_score + fin_score
    
    if total == 0: return "General", 0.0
    if tech_score > fin_score: return "Tech", round(tech_score / total, 2)
    return "Finance", round(fin_score / total, 2)

def evaluate_experience(exp_list, domain, original_state):
    issues = []
    penalty = 0
    if not exp_list or len(exp_list) == 0:
        return 20, [{"penalty": 20, "msg": "No work experience listed"}]
        
    orig_text = json.dumps(original_state).lower()
    orig_nums = set(re.findall(r'\b\d+\b', orig_text))
    orig_tools = {t for t in KNOWN_TOOLS if t in orig_text}
    
    all_verbs = []
    
    for exp in exp_list:
        bullets = exp.get("bullets", []) if isinstance(exp, dict) else [str(exp)]
            
        for bullet in bullets:
            desc = str(bullet)
            desc_lower = desc.lower()
            
            verb_match = re.match(r"^\b(engineered|designed|built|optimized|developed|analyzed|reduced|increased|implemented|automated|deployed|managed|orchestrated|spearheaded|architected|transformed|utilized|integrated|created|improved|configured|led|formulated|executed|resolved|maintained|streamlined|revamped|established|collaborated|authored)\b", desc_lower)
            
            if verb_match:
                all_verbs.append(verb_match.group(1))
            else:
                issues.append({"penalty": 5, "msg": f"Weak Structure: Bullet does not start with a recognized strong action verb -> '{desc[:20]}...'"})
                penalty += 5

            enh_nums = set(re.findall(r'\b\d+\b', desc_lower))
            hallucinated_nums = {n for n in (enh_nums - orig_nums) if len(n) < 4} 
            if hallucinated_nums:
                issues.append({"penalty": 15, "msg": f"Hallucination Guard: Fake metrics {hallucinated_nums} detected."})
                penalty += 15

            enh_tools = {t for t in KNOWN_TOOLS if t in desc_lower}
            hallucinated_tools = enh_tools - orig_tools
            if hallucinated_tools:
                issues.append({"penalty": 15, "msg": f"Hallucination Guard: Fake tools {hallucinated_tools} detected."})
                penalty += 15

            if not enh_tools:
                issues.append({"penalty": 10, "msg": f"Vague Bullet: No specific technology/tool named -> '{desc[:20]}...'"})
                penalty += 10
                
            word_count = len(desc.split())
            if word_count < 10 or word_count > 30:
                issues.append({"penalty": 5, "msg": f"Length Violation: Bullet is {word_count} words (must be 10-30)."})
                penalty += 5

    verb_counts = Counter(all_verbs)
    if any(count > 1 for count in verb_counts.values()):
        issues.append({"penalty": 10, "msg": "Repetition: Action verbs are repeated across the resume."})
        penalty += 10

    return penalty, issues

def evaluate_skills(skills):
    if not skills or len(skills) < 3:
        return 15, [{"penalty": 15, "msg": "Skills section is weak (under 3 skills)"}]
    return 0, []

def evaluate_projects(state, domain):
    if domain == "Tech" and not state.get("github_username") and not state.get("projects"):
        return 15, [{"penalty": 15, "msg": "Missing GitHub profile or projects for Tech domain"}]
    return 0, []

def evaluate_profile(state, original_state=None):
    if not original_state: original_state = state
    domain, _ = get_hybrid_domain(state)
    
    sections = {"experience": 100, "skills": 100, "projects": 100}
    all_issues = []
    
    exp_pen, exp_issues = evaluate_experience(state.get("experience", []), domain, original_state)
    sections["experience"] -= exp_pen
    all_issues.extend(exp_issues)
    
    sk_pen, sk_issues = evaluate_skills(state.get("skills", []))
    sections["skills"] -= sk_pen
    all_issues.extend(sk_issues)
    
    proj_pen, proj_issues = evaluate_projects(state, domain)
    sections["projects"] -= proj_pen
    all_issues.extend(proj_issues)
    
    if not state.get("linkedin"):
        sections["projects"] -= 5 
        all_issues.append({"penalty": 5, "msg": "No LinkedIn profile provided"})
        
    global_score = sum(sections.values()) // 3
    
    total_penalty = sum(issue["penalty"] for issue in all_issues)
    confidence = max(0.0, round(1.0 - (total_penalty / 100), 2))
    
    return {
        "global_score": max(0, global_score),
        "confidence": confidence,
        "sections": sections,
        "issues": all_issues
    }