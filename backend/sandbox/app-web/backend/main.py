from fastapi import FastAPI
from routers.api import router as api_router

app = FastAPI(title="OmniMind App API")
app.include_router(api_router)
