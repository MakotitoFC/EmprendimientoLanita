"""Entry point del bot — modo polling."""
import logging
from bot import build_app

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    level=logging.INFO,
)

if __name__ == "__main__":
    app = build_app()
    logging.info("Bot iniciado en modo polling...")
    app.run_polling(drop_pending_updates=True)
