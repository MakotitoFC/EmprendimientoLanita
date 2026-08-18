"""LLM Router: Groq → OpenRouter → static fallback."""
import httpx
from config import (
    GROQ_API_KEY, GROQ_MODEL,
    OPENROUTER_API_KEY, OPENROUTER_MODEL,
    STATIC_FALLBACK_MSG,
)

SYSTEM_PROMPT = """Eres el asistente de ventas de Artesanías, una tienda de productos artesanales hechos a mano:
- Piezas únicas pintadas en piedra
- Objetos decorativos de cemento
- Cuadros en MDF personalizados

Tu rol:
- Ayudar a los clientes a elegir productos
- Responder preguntas sobre materiales, tamaños, colores, plazos
- Tomar pedidos en nombre del vendedor
- Ser cálido, amigable y conciso
- Si no sabés algo, decís que vas a consultar con el equipo

No inventes precios. Cuando el cliente quiere comprar, guialo a completar sus datos para el pedido.
Responde siempre en español, de forma breve y natural."""


async def _call_groq(messages: list[dict]) -> str:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={"model": GROQ_MODEL, "messages": messages, "max_tokens": 500, "temperature": 0.7},
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


async def _call_openrouter(messages: list[dict]) -> str:
    async with httpx.AsyncClient(timeout=25) as client:
        r = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://artesanias.vercel.app",
                "X-Title": "Artesanias Bot",
            },
            json={"model": OPENROUTER_MODEL, "messages": messages, "max_tokens": 500},
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


async def get_reply(user_message: str, history: list[dict], products_context: str = "") -> str:
    system = SYSTEM_PROMPT
    if products_context:
        system += f"\n\nCATÁLOGO ACTUAL:\n{products_context}"

    messages = [{"role": "system", "content": system}]
    for h in history[-10:]:
        role = "assistant" if h["role"] == "model" else h["role"]
        messages.append({"role": role, "content": h["content"]})
    messages.append({"role": "user", "content": user_message})

    # Try Groq first
    if GROQ_API_KEY:
        try:
            return await _call_groq(messages)
        except Exception:
            pass

    # Fallback to OpenRouter
    if OPENROUTER_API_KEY:
        try:
            return await _call_openrouter(messages)
        except Exception:
            pass

    # Static fallback
    return STATIC_FALLBACK_MSG
