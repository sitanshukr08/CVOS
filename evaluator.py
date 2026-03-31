import re

def get_hybrid_domain(text_corpus):
    text_corpus = str(text_corpus).lower()
    tech_keywords = ["bca", "btech", "cs", "computer", "software", "developer", "github", "api", "python", "fastapi", "sql", "tensorflow", "backend", "frontend"]
    fin_keywords = ["finance", "accounting", "bank", "investment", "commerce", "excel", "equity", "liquidity", "valuation", "bsc"]
    
    tech_score = sum(text_corpus.count(k) for k in tech_keywords)
    fin_score = sum(text_corpus.count(k) for k in fin_keywords)
    total = tech_score + fin_score
    
    if total == 0:
        return "General", 0.0
        
    if tech_score > fin_score:
        return "Tech", round(tech_score / total, 2)
    else:
        return "Finance", round(fin_score / total, 2)

def evaluate_experience(exp_list, domain):
    issues = []
    penalty = 0
    if not exp_list or len(exp_list) == 0:
        issues.append({"penalty": 20, "msg": "No work experience listed"})
        return -20, issues
        
    has_metric = False
    has_weak_verb = False
    has_tech_depth = False
    
    tech_tools = ["python", "fastapi", "sql", "react", "aws", "docker", "machine learning", "api", "java", "c++", "node", "ai"]
    fin_tools = ["excel", "modeling", "valuation", "bloomberg", "dcf", "powerpoint", "summary", "analysis"]
    
    for exp in exp_list:
        desc = str(exp).lower()
        if any(w in desc for w in ["worked on", "helped", "responsible for", "did", "tasked with", "made"]):
            has_weak_verb = True
        if re.search(r'\d+', desc) or any(w in desc for w in ["%", "percent", "increased", "reduced", "optimized"]):
            has_metric = True
        
        if domain == "Tech" and any(t in desc for t in tech_tools):
            has_tech_depth = True
        elif domain == "Finance" and any(t in desc for t in fin_tools):
            has_tech_depth = True
        elif domain == "General":
            has_tech_depth = True 

    if has_weak_verb:
        issues.append({"penalty": 10, "msg": "Weak action verbs detected in experience bullets"})
        penalty -= 10
    if not has_metric:
        issues.append({"penalty": 15, "msg": "No metrics or quantifiable results in experience"})
        penalty -= 15
    if not has_tech_depth:
        issues.append({"penalty": 10, "msg": f"Missing technical depth or specific tools for {domain} domain"})
        penalty -= 10
        
    return penalty, issues

def evaluate_skills(skills):
    if not skills or len(skills) < 3:
        return -15, [{"penalty": 15, "msg": "Skills section is weak (under 3 skills)"}]
    return 0, []

def evaluate_projects(state, domain):
    if domain == "Tech" and not state.get("github_username") and not state.get("projects"):
        return -15, [{"penalty": 15, "msg": "Missing GitHub profile or projects for Tech domain"}]
    return 0, []

def evaluate_profile(state):
    domain, _ = get_hybrid_domain(state)
    score = 100
    all_issues = []
    
    exp_pen, exp_issues = evaluate_experience(state.get("experience", []), domain)
    score += exp_pen
    all_issues.extend(exp_issues)
    
    sk_pen, sk_issues = evaluate_skills(state.get("skills", []))
    score += sk_pen
    all_issues.extend(sk_issues)
    
    proj_pen, proj_issues = evaluate_projects(state, domain)
    score += proj_pen
    all_issues.extend(proj_issues)
    
    if not state.get("linkedin"):
        score -= 5
        all_issues.append({"penalty": 5, "msg": "No LinkedIn profile provided"})
        
    return max(0, score), all_issues