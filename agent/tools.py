from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain.tools import tool
import os
import sqlite3

# Resolve DB path relative to this file so it works regardless of calling CWD
_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../db/chroma"))

vectordb = Chroma(
    persist_directory=_DB_PATH,
    embedding_function=OllamaEmbeddings(model="nomic-embed-text")
)

@tool
def search_codebase(query: str, k: int = 5) -> str:
    """Search the codebase semantically and return up to k matches as a string."""
    docs = vectordb.similarity_search(query, k=k)
    return "\n".join(
        [f"{doc.metadata.get('source')}: {doc.page_content}" for doc in docs]
    )

@tool
def sql_query(query: str) -> str:
    """Run a SQL query against the internal sqlite DB and return results as a string."""
    _sql_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../db/app.db"))
    conn = sqlite3.connect(_sql_db_path)
    try:
        cur = conn.cursor()
        cur.execute(query)
        rows = cur.fetchall()
        return str(rows)
    except Exception as e:
        return str(e)
    finally:
        conn.close()

@tool
def file_lookup(keyword: str) -> str:
    """Find file names in the repo by keyword (case-insensitive)."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "../../"))
    
    matches = []
    ignore_dirs = {".git", "venv", "__pycache__", "db", ".gemini", ".vscode", ".idea", "node_modules"}
    
    for root, dirs, files in os.walk(project_root):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for f in files:
            if keyword.lower() in f.lower():
                matches.append(os.path.join(root, f))
    return "\n".join(matches) if matches else "No matching file."

@tool
def read_file_content(file_path: str) -> str:
    """Read the content of a file from the codebase."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"

TOOLS = [search_codebase, sql_query, file_lookup, read_file_content]