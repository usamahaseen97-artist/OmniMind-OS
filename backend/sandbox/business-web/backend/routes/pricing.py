from fastapi import APIRouter

router = APIRouter(prefix="/pricing", tags=["pricing"])


@router.get("/dynamic")
async def dynamic_pricing(sku: str = "mutton-pack"):
    return {"sku": sku, "price": 24.99, "currency": "USD", "engine": "dynamic"}
