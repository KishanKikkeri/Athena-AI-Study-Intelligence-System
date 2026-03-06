import os
import shutil
import sys

# Ensure we can import from intern
sys.path.append(os.getcwd())

from intern.ingest.ingest_codebase import ingest_to_chroma

def add_repo(source_path):
    if not os.path.exists(source_path):
        print(f"Error: Path '{source_path}' does not exist.")
        return

    repo_name = os.path.basename(os.path.normpath(source_path))
    dest_path = os.path.join("source_code", repo_name)

    # Copy files
    if os.path.exists(dest_path):
        print(f"Removing existing {dest_path}...")
        shutil.rmtree(dest_path)
    
    print(f"Copying '{source_path}' to '{dest_path}'...")
    shutil.copytree(source_path, dest_path)

    # Ingest
    print(f"Ingesting '{dest_path}' into vector database...")
    ingest_to_chroma(dest_path)
    print("Done!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python add_repo.py <path_to_external_repo>")
    else:
        add_repo(sys.argv[1])
