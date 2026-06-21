class SalesController:
    def checkout(self, cart_id: str) -> dict:
        return {"cart_id": cart_id, "status": "confirmed", "channel": "ecommerce"}
