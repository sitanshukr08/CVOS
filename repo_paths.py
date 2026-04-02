from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parent
CORE_BACKEND_DIR = ROOT_DIR / "core-backend"
FEATURE_1_CHAT_AGENT_DIR = ROOT_DIR / "feature-1-chat-agent"
FEATURE_2_GITHUB_FETCHER_DIR = ROOT_DIR / "feature-2-github-fetcher"
FEATURE_3_WRITER_DIR = ROOT_DIR / "feature-3-writer"
FEATURE_4_EVALUATOR_DIR = ROOT_DIR / "feature-4-evaluator"
FEATURE_5_PDF_GENERATOR_DIR = ROOT_DIR / "feature-5-pdf-generator"
DATABASE_DIR = ROOT_DIR / "database"
CHROMA_DIR = DATABASE_DIR / "chroma_db"
CHAT_SESSION_FILE = FEATURE_1_CHAT_AGENT_DIR / "session.json"


def add_sys_path(*paths: Path) -> None:
    for path in paths:
        path_str = str(path)
        if path_str not in sys.path:
            sys.path.insert(0, path_str)
