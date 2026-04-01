# CVOS (Curriculum Vitae Operating System)

CVOS is an autonomous, AI-driven backend engine that generates elite, ATS-optimized LaTeX resumes. It does not just format text; it uses a recursive evaluation loop, Retrieval-Augmented Generation (RAG), and strict hallucination guards to engineer perfect resume bullets, infer skills from GitHub, and compile a production-ready PDF.

## Core Architecture

CVOS operates on a recursive cognitive loop:
1. **Data Collection:** Gathers raw, unstructured user data (via chat or future frontend form).
2. **Context Enrichment:** Scrapes GitHub to fetch real project data and language statistics.
3. **The Enhancement Loop:** The LLM (Groq) rewrites the data using high-performing RAG examples.
4. **The Evaluator:** An NLP-based scoring system grades the output. If the score is under 95, it feeds the errors back to the LLM to try again (Convergence Loop).
5. **Self-Learning:** If the generated resume scores >95 with high confidence, the system hashes and saves the generated bullets back into its vector database to learn for next time.
6. **Compilation:** The finalized JSON is injected into a LaTeX template and compiled to PDF.

---

## File Structure & System Breakdown

Here is a detailed explanation of the core backend files so frontend developers know exactly where data is processed.

### 1. `app.py` (The API Gateway)
This is the FastAPI server. Currently, it initializes the backend services, but moving forward, this will house the REST endpoints (like `/generate-resume` or `/evaluate-profile`) that the frontend React/Next.js application will call.

### 2. `chat_agent.py` (State Management & CLI)
This is the current interactive terminal interface. 
- It manages the user's state using a local `session.json` file.
- It acts as the orchestrator: prompting the user, gathering missing fields, calling the GitHub fetcher, and eventually triggering the AI writer and PDF compiler.
- For a frontend integration, the state management logic here will be replaced by the frontend's global state (like Redux or Zustand).

### 3. `writer.py` (The LLM Engine & RAG Integrator)
This is the brain of the AI. 
- **RAG Implementation:** Queries ChromaDB for "Golden Bullets" matching the user's domain (Tech vs. Finance) to show the LLM stylistic examples.
- **Recursive Enhancement:** Contains the `recursive_enhance` loop. It commands the LLM to rewrite the resume, passes the output to the Evaluator, and repeats until the resume achieves a perfect score.
- **Self-Learning:** If the Evaluator yields a 95+ score, this script hashes the new bullets and saves them permanently into ChromaDB.

### 4. `evaluator.py` (The Strict Validator)
This script prevents the LLM from outputting garbage or hallucinating. It does not use AI; it uses strict Python logic, NLP, and Regex.
- **Hallucination Guards:** Compares the AI's output against the user's original raw input. If the AI invents a metric (like "increased sales by 50%") or a fake tool, it slaps a massive penalty on the score.
- **Structural Enforcement:** Uses Regex to ensure every bullet starts with a strong action verb and falls within the 10-30 word count limit.
- Returns a detailed `sections` score and an overall `confidence` percentage.

### 5. `github_fetcher.py` (Zero-Shot Project Extraction)
Given just a GitHub username, this script hits the public GitHub REST API.
- It fetches the user's top repositories, primary languages, and descriptions.
- It passes this data back to the LLM to automatically generate highly technical, ATS-friendly project bullets without the user typing a single word.

### 6. `pdf_generator.py` (The Compiler)
Takes the finalized, perfect JSON data and dynamically injects it into a `.tex` (LaTeX) template using Jinja2. It then runs system-level `pdflatex` commands to generate a clean, perfectly formatted PDF.

### 7. `ingest_to_chroma.py` (Database Initializer)
A one-time setup script. It reads a massive Kaggle dataset of standard resumes, filters out 99% of the noise to find only the "Golden Bullets" (sentences with perfect verbs, metrics, and technical depth), and embeds them into the local ChromaDB vector database.

---

## Setup & Installation

**1. Clone and Install Dependencies**
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

**2. Environment Variables**
Create a `.env` file in the root directory and add your API key:
```text
GROQ_API_KEY=your_groq_api_key_here
```

**3. Initialize the Vector Database**
Run this once to build the RAG engine memory:
```bash
python ingest_to_chroma.py
```

**4. Run the Application**
To test the interactive agent:
```bash
python chat_agent.py
```
To run the API server (for frontend integration):
```bash
python app.py
```
