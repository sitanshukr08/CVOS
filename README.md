# CVOS (Curriculum Vitae Operating System) 📄✨

An autonomous, AI-driven engine and premium frontend interface that generates elite, ATS-optimized LaTeX resumes. 

CVOS doesn't just format text; it acts as a Senior Technical Recruiter. It uses a dual-LLM agentic loop, Retrieval-Augmented Generation (RAG), and strict hallucination guards to engineer perfect resume bullets, infer skills from GitHub, and compile a production-ready PDF.

---

## 🌟 Core Features

* **🤖 Agentic Chat Assistant:** A proactive, dual-LLM architecture (Drafter + Critic). It actively interviews you, extracts measurable metrics, filters fluff, and rewrites your bullets in real-time.
* **⚡ Concurrent GitHub Integration:** Enter your GitHub username, and CVOS will concurrently fetch your top public repositories, analyze the code/languages, and generate ATS-friendly project bullets in seconds.
* **🔄 Live Sync PDF Generation:** A beautiful, Framer Motion-powered review dashboard. Edit your resume data and instantly re-compile a production-ready LaTeX PDF.
* **🧠 Recursive RAG & Evaluation:** Uses ChromaDB to feed the AI "Golden Resume" examples. A strict Python evaluator grades the LLM's output and forces it to rewrite until the resume achieves a 95+ score.
* **✨ Premium UI:** Buttery-smooth physics, spring animations, and highly responsive components built with TailwindCSS and Framer Motion.

---

## 🏗️ Tech Stack

### **Frontend**
* React (Vite / Next.js)
* TailwindCSS & Shadcn UI
* Framer Motion (Advanced Spring Physics)
* Lucide React (Iconography)

### **Backend**
* Python 3.10+ & FastAPI
* Groq API (Llama 3.3 70B & Llama 3.1 8B)
* ChromaDB (Vector Database for RAG)
* `pdflatex` (LaTeX to PDF Compilation)
* `asyncio` (Concurrent processing)

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)
* **LaTeX Distribution:** You must have `pdflatex` installed on your system to compile the PDFs.
  * **Mac:** `brew install mactex` or download MacTeX.
  * **Linux:** `sudo apt-get install texlive-full`
  * **Windows:** Download and install MiKTeX.

### 2. Backend Setup
Navigate to the root directory and set up your Python environment:

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file in the root directory and add:
GROQ_API_KEY=your_groq_api_key_here

# Run the FastAPI server
cd core-backend
python app.py
```

*The backend will run on `http://localhost:8000`*

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

*The frontend will run on `http://localhost:5173` (or 3000)*

---

## 🗺️ System Architecture 

* **Data Intake:** The user fills out basic professional information and imports relevant GitHub repositories.
* **Agentic Refinement:** The user chats with the CVOS Assistant to enhance bullet points. A Critic LLM oversees the process to ensure the Drafter LLM accurately applies updates directly to the global JSON state.
* **The Enhancement Loop:** When the user clicks Generate, the backend LLM rewrites the data using high-performing RAG (Retrieval-Augmented Generation) examples to ensure maximum impact.
* **The Evaluator:** An NLP-based scoring system meticulously grades the output. If the score falls below 95, it feeds the errors back to the LLM to rewrite and try again (Convergence Loop).
* **Compilation:** The finalized, high-scoring JSON is injected into a professional LaTeX template and compiled into a beautifully formatted PDF.

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
