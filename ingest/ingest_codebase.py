import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader

# Non-PDF text extensions to load with TextLoader
TEXT_EXT = [".txt", ".md", ".py", ".js", ".ts", ".html", ".css", ".json"]

# Resolve DB path relative to this file, not the calling CWD
_DEFAULT_PERSIST_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../db/chroma")
)

# load the codebase
def load_files(path: str):
    docs = []
    for root, _, files in os.walk(path):
        for f in files:
            file_path = os.path.join(root, f)

            if f.endswith(".pdf"):
                print(f"Loading PDF: {file_path}")
                loader = PyPDFLoader(file_path)
                docs.extend(loader.load())

            elif any(f.endswith(ext) for ext in TEXT_EXT):
                print(f"Loading: {file_path}")
                loader = TextLoader(file_path, encoding="utf-8")
                docs.extend(loader.load())

    return docs

# split codebase code files in chunks
def chunk_docs(docs):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100
    )
    return splitter.split_documents(docs)

# feed the chunks to chromadb
def ingest_to_chroma(repo_path: str, persist_dir: str = _DEFAULT_PERSIST_DIR):
    docs = load_files(repo_path)
    if not docs:
        print("Warning: No documents found to ingest.")
        return

    chunks = chunk_docs(docs)

    Chroma.from_documents(
        chunks,
        embedding=OllamaEmbeddings(model="nomic-embed-text"),
        persist_directory=persist_dir
    )
    # Note: chromadb >= 0.4 auto-persists; no need to call .persist()
    print(f"Ingestion complete. {len(chunks)} chunks stored in '{persist_dir}'.")

if __name__ == "__main__":
    ingest_to_chroma(os.path.join(os.path.dirname(__file__), "../../intern/source_code"))
