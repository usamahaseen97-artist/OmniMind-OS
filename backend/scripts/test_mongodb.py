"""Run: python scripts/test_mongodb.py (from backend folder)"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv()

from database import init_collections, ping, uri_safe_diagnostics

if __name__ == "__main__":
    print("URI diagnostics:", uri_safe_diagnostics())
    status = ping()
    print("MongoDB ping:", status)
    if status.get("connected"):
        print("Init:", init_collections())
    else:
        print("\nFix: see hint above and backend/.env.example")
