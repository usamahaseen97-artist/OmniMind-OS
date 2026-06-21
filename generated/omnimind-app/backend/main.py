"""FastAPI backend — Omnimind V11 Custom Full-Stack Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.terminal_stream import router as terminal_stream_router

app = FastAPI(title="Omnimind V11 Custom Full-Stack Application")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(terminal_stream_router)


@app.get("/")
def root():
    return {"ok": True, "app": "Omnimind V11 Custom Full-Stack Application", "stack": "fastapi"}


@app.get("/api/health")
def health():
    return {"status": "online", "database_mode": "managed_mongo"}

