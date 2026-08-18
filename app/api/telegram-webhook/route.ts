import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service client — bypasses RLS para el bot
function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? ''

async function tg(method: string, body: object) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function sendTyping(chatId: number) {
  await tg('sendChatAction', { chat_id: chatId, action: 'typing' })
}

async function sendMessage(chatId: number, text: string) {
  await tg('sendMessage', { chat_id: chatId, text, parse_mode: 'Markdown' })
}

async function getHistory(chatId: string) {
  const db = serviceClient()
  const { data } = await db
    .from('chat_history')
    .select('role, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(16)
  return (data ?? []).reverse()
}

async function saveMessage(chatId: string, role: string, content: string) {
  const db = serviceClient()
  await db.from('chat_history').insert({ chat_id: chatId, role, content })
}

async function getProducts() {
  const db = serviceClient()
  const { data } = await db
    .from('productos')
    .select('nombre, tipo, precio_base, descripcion_corta')
    .eq('is_active', true)
  return data ?? []
}

async function getLLMReply(userMsg: string, history: { role: string; content: string }[], productsCtx: string) {
  const GROQ_KEY = process.env.GROQ_API_KEY
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

  const systemPrompt = `Eres el asistente de ventas de Artesanías de Lanita, tienda artesanal peruana.
Productos: piedras pintadas únicas, objetos de cemento personalizables, cuadros MDF con diseño propio.
Respondé en español, de forma breve y cálida. No inventes precios.
Para hacer un pedido, dirigí al cliente a la web donde puede usar el carrito.

CATÁLOGO:\n${productsCtx}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.content })),
    { role: 'user', content: userMsg },
  ]

  // Groq
  if (GROQ_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 400 }),
      })
      if (r.ok) {
        const j = await r.json()
        return j.choices[0].message.content as string
      }
    } catch { /* fallthrough */ }
  }

  // OpenRouter fallback
  if (OPENROUTER_KEY) {
    try {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENROUTER_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct', messages, max_tokens: 400 }),
      })
      if (r.ok) {
        const j = await r.json()
        return j.choices[0].message.content as string
      }
    } catch { /* fallthrough */ }
  }

  return 'Hola 👋 Podés ver nuestro catálogo en la web y hacer tu pedido desde ahí. ¿En qué te puedo ayudar?'
}

// POST — Telegram llama aquí con cada mensaje
export async function POST(req: NextRequest) {
  // Verificar el secret header
  if (WEBHOOK_SECRET && req.headers.get('x-telegram-bot-api-secret-token') !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const update = await req.json()
  const message = update?.message
  if (!message?.text) return NextResponse.json({ ok: true })

  const chatId: number = message.chat.id
  const chatIdStr = String(chatId)
  const text: string = message.text
  const username: string | undefined = message.from?.username

  // Comandos básicos
  if (text === '/start') {
    await sendMessage(chatId,
      `Hola ${message.from?.first_name ?? ''} 👋 Soy el asistente de *Artesanías de Lanita*.\n\nPodés preguntarme sobre productos o precios. Para hacer un pedido usá el carrito en nuestra web 🛍️`
    )
    return NextResponse.json({ ok: true })
  }

  if (text === '/catalogo') {
    await sendTyping(chatId)
    const products = await getProducts()
    if (!products.length) {
      await sendMessage(chatId, 'No hay productos disponibles en este momento.')
    } else {
      const icons: Record<string, string> = { piedra: '🪨', cemento: '🏺', mdf: '🖼️' }
      const lines = products.map(p => `${icons[p.tipo] ?? '•'} *${p.nombre}* — S/ ${p.precio_base.toFixed(2)}${p.descripcion_corta ? `\n  _${p.descripcion_corta}_` : ''}`)
      await sendMessage(chatId, '📦 *Catálogo:*\n\n' + lines.join('\n'))
    }
    return NextResponse.json({ ok: true })
  }

  // Mensaje de texto libre → LLM
  await sendTyping(chatId)

  const [history, products] = await Promise.all([
    getHistory(chatIdStr).catch(() => []),
    getProducts().catch(() => []),
  ])

  const productsCtx = products
    .map(p => `- ${p.nombre} (${p.tipo}) S/ ${p.precio_base}: ${p.descripcion_corta ?? ''}`)
    .join('\n')

  const reply = await getLLMReply(text, history, productsCtx)

  await Promise.all([
    sendMessage(chatId, reply),
    saveMessage(chatIdStr, 'user', text).catch(() => {}),
    saveMessage(chatIdStr, 'model', reply).catch(() => {}),
  ])

  return NextResponse.json({ ok: true })
}

// GET — para registrar el webhook desde el browser
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url param' }, { status: 400 })

  const r = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        secret_token: WEBHOOK_SECRET || undefined,
        allowed_updates: ['message'],
      }),
    }
  )
  const json = await r.json()
  return NextResponse.json(json)
}
