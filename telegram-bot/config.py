import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

GROQ_MODEL = "llama-3.3-70b-versatile"
OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct"

MAX_MESSAGES_PER_MINUTE = 30
MAX_HISTORY_MESSAGES = 20

STATIC_FALLBACK_MSG = (
    "Hola 👋 Soy el asistente de Artesanías.\n\n"
    "Podés ver nuestro catálogo en la web. "
    "Para hacer un pedido, usá el carrito y completá el checkout.\n\n"
    "¿En qué te puedo ayudar?"
)
