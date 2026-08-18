"""Supabase client usando httpx directamente (sin supabase-py)."""
import httpx
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

BASE = f"{SUPABASE_URL}/rest/v1"


async def select(table: str, params: dict | None = None, *, single: bool = False) -> list | dict | None:
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE}/{table}", headers=HEADERS, params=params or {})
        r.raise_for_status()
        data = r.json()
        return data[0] if single and data else data


async def insert(table: str, payload: dict | list) -> list:
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BASE}/{table}", headers=HEADERS, json=payload)
        r.raise_for_status()
        return r.json()


async def update(table: str, payload: dict, match: dict) -> list:
    params = {k: f"eq.{v}" for k, v in match.items()}
    async with httpx.AsyncClient() as client:
        r = await client.patch(f"{BASE}/{table}", headers=HEADERS, json=payload, params=params)
        r.raise_for_status()
        return r.json()


async def upsert(table: str, payload: dict, on_conflict: str = "id") -> list:
    headers = {**HEADERS, "Prefer": f"resolution=merge-duplicates,return=representation"}
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BASE}/{table}?on_conflict={on_conflict}", headers=headers, json=payload)
        r.raise_for_status()
        return r.json()


async def get_products(tipo: str | None = None) -> list:
    params = {"is_active": "eq.true", "select": "id,nombre,descripcion_corta,precio_base,tipo"}
    if tipo:
        params["tipo"] = f"eq.{tipo}"
    return await select("productos", params)


async def get_chat_history(chat_id: str, limit: int = 20) -> list:
    params = {
        "chat_id": f"eq.{chat_id}",
        "order": "created_at.desc",
        "limit": str(limit),
        "select": "role,content",
    }
    rows = await select("chat_history", params)
    return list(reversed(rows or []))


async def save_message(chat_id: str, role: str, content: str, metadata: dict | None = None) -> None:
    await insert("chat_history", {
        "chat_id": str(chat_id),
        "role": role,
        "content": content,
        "metadata": metadata or {},
    })


async def upsert_customer(email: str, name: str, phone: str, telegram_username: str | None = None) -> str:
    rows = await select("customers", {"email": f"eq.{email}", "select": "id"})
    if rows:
        return rows[0]["id"]
    result = await insert("customers", {
        "email": email,
        "name": name,
        "phone": phone,
        "telegram_username": telegram_username,
    })
    return result[0]["id"]


async def create_order(customer_id: str, total: float, items: list, telegram_chat_id: str, notes: str = "") -> str:
    result = await insert("orders", {
        "customer_id": customer_id,
        "total": total,
        "source": "telegram",
        "status": "pending",
        "telegram_chat_id": str(telegram_chat_id),
        "notes": notes,
    })
    order_id = result[0]["id"]
    for item in items:
        await insert("order_items", {
            "order_id": order_id,
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "unit_price": item["unit_price"],
            "options": item.get("options", {}),
        })
    return order_id
