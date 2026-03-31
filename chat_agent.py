import os
import json
import requests
import tempfile
import readline
from groq import Groq
from dotenv import load_dotenv
from evaluator import evaluate_profile, get_hybrid_domain

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
API_URL = "http://localhost:8000/generate-resume"
SESSION_FILE = "session.json"

default_state = {
    "name": None,
    "email": None,
    "github_username": None,
    "phone": None,
    "linkedin": None,
    "skills": [],
    "education": [],
    "experience": [],
    "inferred_domain": None,
    "has_asked_domain_specifics": False,
    "has_asked_for_skills": False,
    "ready_to_generate": False
}

def load_session():
    if os.path.exists(SESSION_FILE):
        try:
            with open(SESSION_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass
    return default_state.copy()

def save_session(state):
    dir_name = os.path.dirname(os.path.abspath(SESSION_FILE))
    with tempfile.NamedTemporaryFile('w', delete=False, dir=dir_name) as tf:
        json.dump(state, tf, indent=2)
        tempname = tf.name
    os.replace(tempname, SESSION_FILE)

current_state = load_session()

def safe_merge(current, new_state):
    for key in current.keys():
        if key in new_state and new_state[key] is not None:
            if isinstance(new_state[key], list) and len(new_state[key]) == 0 and len(current[key]) > 0:
                continue
            current[key] = new_state[key]
            
    domain, conf = get_hybrid_domain(current)
    if conf > 0.3:
        current["inferred_domain"] = domain
    else:
        current["inferred_domain"] = "General"
        
    return current

def validate_state(state):
    missing = []
    if not state.get("name"): missing.append("Name")
    if not state.get("email"): missing.append("Email")
    return (False, f"Missing required fields: {', '.join(missing)}") if missing else (True, "Valid")

def get_agent_response(user_input, history):
    system_prompt = f"""
    You are an intelligent AI Recruiter. 
    CURRENT SYSTEM STATE: {json.dumps(current_state, indent=2)}

    RULES:
    1. ACCEPTING 'NO': If a user explicitly states they DO NOT have experience, a GitHub, or a LinkedIn, ACCEPT IT. Leave the field as null/empty.
    2. MISSING DATA: If skills, education, or dates are vague (and user hasn't explicitly said they have none), ASK FOR THEM.
    3. METRICS COACHING: If their experience lacks numbers/metrics, suggest adding them.
    4. ONLY set `ready_to_generate` to true IF Name and Email are collected, AND you have collected or confirmed they lack skills/domain specifics.
    
    OUTPUT STRICT JSON:
    {{
        "thought_process": "",
        "suggested_state_updates": {{}},
        "feedback_for_user": "",
        "reply_to_user": ""
    }}
    """
    
    messages = [{"role": "system", "content": system_prompt}] + history
    if user_input:
        messages.append({"role": "user", "content": user_input})

    res = client.chat.completions.create(
        messages=messages,
        model="llama-3.3-70b-versatile",
        temperature=0.1, 
        response_format={"type": "json_object"}
    )
    return json.loads(res.choices[0].message.content)

def chat_interface():
    global current_state
    history = []
    
    print("=========================================================")
    print("AI Recruiter (Type 'quit' to exit, 'clear' to reset)")
    print("=========================================================\n")
    
    response = get_agent_response(None, history)
    current_state = safe_merge(current_state, response.get("suggested_state_updates", {}))
    save_session(current_state)
    print(f"AI: {response['reply_to_user']}\n")

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ['quit', 'exit']: break
        if user_input.lower() == 'clear':
            if os.path.exists(SESSION_FILE): os.remove(SESSION_FILE)
            current_state = default_state.copy()
            print("Session cleared.")
            continue
            
        history.append({"role": "user", "content": user_input})
        
        response = get_agent_response(user_input, history)
        current_state = safe_merge(current_state, response.get("suggested_state_updates", {}))
        save_session(current_state)
        
        if response.get("feedback_for_user"):
            print(f"\n💡 Tip: {response['feedback_for_user']}")
            
        print(f"\nAI: {response['reply_to_user']}\n")
        history.append({"role": "assistant", "content": response['reply_to_user']})

        if current_state.get("ready_to_generate"):
            is_valid, error_msg = validate_state(current_state)
            if not is_valid:
                print(f"❌ System Blocked: {error_msg}")
                current_state["ready_to_generate"] = False
                save_session(current_state)
                continue
            
            score, issues = evaluate_profile(current_state)
            print(f"\n📊 RESUME QUALITY SCORE: {score}/100")
            
            if issues:
                print("⚠️ Improvements detected:")
                for issue in issues:
                    print(f"  - [-{issue['penalty']} pts] {issue['msg']}")
                
                force = input("\nGenerate anyway? (yes/no): ").strip().lower()
                if not (force in ['yes', 'y', 'generate'] or 'yes' in force or 'generate' in force):
                    current_state["ready_to_generate"] = False
                    save_session(current_state)
                    print("\nAI: Let's fix those issues. What would you like to update?")
                    continue
                
            print("🚀 Compiling...")
            try:
                r = requests.post(API_URL, json=current_state)
                if r.status_code == 200:
                    fname = f"{current_state['name'].replace(' ', '_')}_Resume.pdf"
                    with open(fname, 'wb') as f:
                        f.write(r.content)
                    print(f"✅ Success! Saved as {fname}")
                    break
                else:
                    try:
                        err_msg = r.json().get("detail", r.text)
                    except:
                        err_msg = r.text
                    print(f"❌ Backend Error {r.status_code}: {err_msg}")
                    current_state["ready_to_generate"] = False
                    save_session(current_state)
            except Exception as e:
                print(f"❌ Connection Error: {e}")
                break

if __name__ == "__main__":
    chat_interface()