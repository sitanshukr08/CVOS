from pathlib import Path
import sys
import pandas as pd
import chromadb
import re
import uuid

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from repo_paths import CHROMA_DIR

print("Initializing ChromaDB...")
client = chromadb.PersistentClient(path=str(CHROMA_DIR))

try:
    client.delete_collection("golden_bullets")
except:
    pass

collection = client.create_collection(
    name="golden_bullets",
    metadata={"hnsw:space": "cosine"}
)

STRONG_VERBS = [
    "engineered", "architected", "spearheaded", "optimized", "developed",
    "designed", "analyzed", "reduced", "increased", "implemented", "built",
    "automated", "deployed", "managed", "orchestrated", "transformed", "generated"
]

def is_golden_bullet(text: str) -> bool:
    """The Gatekeeper: Only allows elite, ATS-friendly bullets through."""
    text = text.strip()
    
    if len(text) < 50 or len(text) > 300:
        return False
        
    if not re.search(r'\d+', text) and not any(char in text for char in ['%', '$']):
        return False
        
    text_lower = text.lower()
    if not any(verb in text_lower for verb in STRONG_VERBS):
        return False
        
    if any(weak in text_lower for weak in ["helped", "worked on", "responsible for", "duties included", "did"]):
        return False
        
    return True

def process_and_ingest(csv_path=None):
    if csv_path is None:
        csv_path = ROOT_DIR / "dataset" / "Resume" / "Resume.csv"

    try:
        print(f"Loading {csv_path}...")
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print("Error: Resume.csv not found. Please download it from Kaggle and place it in this folder.")
        sys.exit(1)

    print(f"Found {len(df)} resumes. Mining for golden bullets...\n")
    
    documents = []
    metadatas = []
    ids = []
    
    for index, row in df.iterrows():
        domain = row['Category']
        raw_text = str(row['Resume_str'])

        potential_bullets = re.split(r'\n|•|\*', raw_text)
        
        for bullet in potential_bullets:
            clean_bullet = re.sub(r'\s+', ' ', bullet).strip()
            
            if is_golden_bullet(clean_bullet):
                documents.append(clean_bullet)
                metadatas.append({"domain": domain})
                ids.append(str(uuid.uuid4()))

    print(f"💎 Extraction Complete! Found {len(documents)} Golden Bullets out of millions of sentences.")
    
    if len(documents) == 0:
        print("No bullets passed the strict filter. Check your regex!")
        return

    print("Ingesting into ChromaDB (this may take a minute as it generates vector embeddings)...")
    batch_size = 1000
    for i in range(0, len(documents), batch_size):
        end = min(i + batch_size, len(documents))
        collection.add(
            documents=documents[i:end],
            metadatas=metadatas[i:end],
            ids=ids[i:end]
        )
        print(f"  -> Ingested {end}/{len(documents)} bullets")
        
    print("\nSuccess! ChromaDB is loaded and ready for RAG.")

if __name__ == "__main__":
    process_and_ingest()
