"""Bot principal de Telegram."""
import asyncio
import time
from collections import defaultdict
from contextlib import asynccontextmanager

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

import supabase_client as db
from llm_router import get_reply
from order_flow import get_state, start_checkout, handle_checkout_step, clear_state
from config import TELEGRAM_BOT_TOKEN, MAX_MESSAGES_PER_MINUTE

# Rate limiting: (chat_id -> [timestamps])
_rate_log: dict[str, list[float]] = defaultdict(list)


@asynccontextmanager
async def typing_action(bot, chat_id):
    """Mantiene el indicador 'escribiendo...' mientras dure el bloque."""
    async def keep_typing():
        while True:
            await bot.send_chat_action(chat_id=chat_id, action="typing")
            await asyncio.sleep(4)

    task = asyncio.create_task(keep_typing())
    try:
        yield
    finally:
        task.cancel()


def _is_rate_limited(chat_id: str) -> bool:
    now = time.time()
    times = _rate_log[chat_id]
    times[:] = [t for t in times if now - t < 60]
    if len(times) >= MAX_MESSAGES_PER_MINUTE:
        return True
    times.append(now)
    return False


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    await update.message.reply_text(
        f"Hola {user.first_name} 👋 Soy el asistente de Artesanías.\n\n"
        "Podés preguntarme sobre nuestros productos, precios o hacer un pedido.\n"
        "¿En qué te puedo ayudar?",
        parse_mode="Markdown",
    )


async def cmd_catalogo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    async with typing_action(context.bot, update.effective_chat.id):
        products = await db.get_products()
    if not products:
        await update.message.reply_text("No hay productos disponibles en este momento.")
        return
    lines = []
    for p in products:
        tipo = {"piedra": "🪨", "cemento": "🏺", "mdf": "🖼️"}.get(p["tipo"], "•")
        lines.append(f"{tipo} *{p['nombre']}* — S/ {p['precio_base']:.2f}")
        if p.get("descripcion_corta"):
            lines.append(f"  _{p['descripcion_corta']}_")
    await update.message.reply_text(
        "📦 *Nuestro catálogo:*\n\n" + "\n".join(lines),
        parse_mode="Markdown",
    )


async def cmd_carrito(update: Update, context: ContextTypes.DEFAULT_TYPE):
    async with typing_action(context.bot, update.effective_chat.id):
        state = get_state(str(update.effective_chat.id))
        msg = state.cart_summary()
    await update.message.reply_text(msg, parse_mode="Markdown")


async def cmd_checkout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    async with typing_action(context.bot, update.effective_chat.id):
        state = get_state(str(update.effective_chat.id))
        msg = start_checkout(state)
    await update.message.reply_text(msg, parse_mode="Markdown")


async def cmd_cancelar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    clear_state(str(update.effective_chat.id))
    await update.message.reply_text("Pedido cancelado. ¡Cuando quieras volvés! 😊")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    text = update.message.text or ""

    if _is_rate_limited(chat_id):
        await update.message.reply_text("Despacio! Enviás muchos mensajes. Esperá un momento.")
        return

    state = get_state(chat_id)

    # In checkout flow
    if state.step not in ("idle", "done"):
        reply, order_complete = await handle_checkout_step(state, text)

        if order_complete:
            # Complete the order
            try:
                customer_id = await db.upsert_customer(
                    email=state.customer["email"],
                    name=state.customer["name"],
                    phone=state.customer["phone"],
                    telegram_username=update.effective_user.username,
                )
                order_id = await db.create_order(
                    customer_id=customer_id,
                    total=state.total,
                    items=state.cart,
                    telegram_chat_id=chat_id,
                )
                await update.message.reply_text(
                    f"🎉 *¡Pedido confirmado!*\n\n"
                    f"N° de pedido: `{order_id[:8]}...`\n\n"
                    f"Te vamos a contactar pronto para coordinar el pago y envío.\n"
                    f"¡Gracias por elegirnos! 💛",
                    parse_mode="Markdown",
                )
                clear_state(chat_id)
            except Exception as e:
                await update.message.reply_text(
                    "Hubo un error al procesar tu pedido. Por favor intentá de nuevo o escribinos directamente."
                )
        elif reply:
            await update.message.reply_text(reply, parse_mode="Markdown")
        return

    # Save user message (best effort)
    try:
        await db.save_message(chat_id, "user", text)
    except Exception:
        pass

    # Load history + products for context (best effort)
    history = []
    products_context = ""
    try:
        history = await db.get_chat_history(chat_id)
        products = await db.get_products()
        products_context = "\n".join(
            f"- {p['nombre']} ({p['tipo']}) S/ {p['precio_base']:.2f}: {p.get('descripcion_corta', '')}"
            for p in products
        )
    except Exception:
        pass

    # Mostrar "escribiendo..." durante todo el tiempo que tarde el LLM
    async with typing_action(context.bot, update.effective_chat.id):
        reply = await get_reply(text, history, products_context)

    # Save bot reply (best effort)
    try:
        await db.save_message(chat_id, "model", reply)
    except Exception:
        pass

    await update.message.reply_text(reply, parse_mode="Markdown")


def build_app() -> Application:
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("catalogo", cmd_catalogo))
    app.add_handler(CommandHandler("carrito", cmd_carrito))
    app.add_handler(CommandHandler("checkout", cmd_checkout))
    app.add_handler(CommandHandler("cancelar", cmd_cancelar))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    return app
