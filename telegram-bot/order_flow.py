"""State machine para el flujo de pedidos por Telegram."""
from dataclasses import dataclass, field
from typing import Any


@dataclass
class OrderState:
    chat_id: str
    step: str = "idle"  # idle | collecting_name | collecting_email | collecting_phone | confirming | done
    cart: list[dict] = field(default_factory=list)
    customer: dict = field(default_factory=dict)
    pending_product: dict | None = None

    def reset(self):
        self.step = "idle"
        self.cart = []
        self.customer = {}
        self.pending_product = None

    @property
    def total(self) -> float:
        return sum(i["unit_price"] * i["quantity"] for i in self.cart)

    def cart_summary(self) -> str:
        if not self.cart:
            return "Tu carrito está vacío."
        lines = [f"• {i['name']} x{i['quantity']} — S/ {i['unit_price'] * i['quantity']:.2f}" for i in self.cart]
        lines.append(f"\n*Total: S/ {self.total:.2f}*")
        return "\n".join(lines)


# In-memory store (per process; fine for single-instance bot)
_states: dict[str, OrderState] = {}


def get_state(chat_id: str) -> OrderState:
    if chat_id not in _states:
        _states[chat_id] = OrderState(chat_id=str(chat_id))
    return _states[chat_id]


def clear_state(chat_id: str):
    _states.pop(chat_id, None)


async def handle_checkout_step(state: OrderState, text: str) -> tuple[str, bool]:
    """Returns (reply_text, is_order_complete)."""
    step = state.step

    if step == "collecting_name":
        state.customer["name"] = text.strip()
        state.step = "collecting_email"
        return "Perfecto! ¿Cuál es tu email? 📧", False

    elif step == "collecting_email":
        if "@" not in text or "." not in text:
            return "Ese email no parece válido. Ingresá tu email completo (ej: maria@gmail.com).", False
        state.customer["email"] = text.strip().lower()
        state.step = "collecting_phone"
        return "Casi listo! ¿Tu número de teléfono? 📱", False

    elif step == "collecting_phone":
        state.customer["phone"] = text.strip()
        state.step = "confirming"
        summary = state.cart_summary()
        return (
            f"✅ *Resumen de tu pedido:*\n\n{summary}\n\n"
            f"👤 Nombre: {state.customer['name']}\n"
            f"📧 Email: {state.customer['email']}\n"
            f"📱 Teléfono: {state.customer['phone']}\n\n"
            f"¿Confirmás el pedido? Respondé *SÍ* para confirmar o *NO* para cancelar.",
            False,
        )

    elif step == "confirming":
        if text.strip().upper() in ("SI", "SÍ", "S", "YES", "OK", "CONFIRMAR", "CONFIRMO"):
            return "", True  # Signal to complete the order
        else:
            state.reset()
            return "Pedido cancelado. Cuando quieras empezar de nuevo, decime qué te interesa 😊", False

    return "Escribí algo para continuar.", False


def start_checkout(state: OrderState) -> str:
    if not state.cart:
        return "Tu carrito está vacío. Primero elegí algún producto."
    state.step = "collecting_name"
    return (
        f"¡Genial! Vamos a procesar tu pedido 🛍️\n\n{state.cart_summary()}\n\n"
        "Para confirmar, necesito algunos datos.\n"
        "¿Cuál es tu nombre completo?"
    )
