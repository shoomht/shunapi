import { sendMessage } from '../bot/bot.js';

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default function telegramNotif(req, res, next) {
  if (!req.path.startsWith('/api/')) return next();

  const startTime = Date.now();
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const responseTime = Date.now() - startTime;
    const status = res.statusCode;
    notify({ req, ip, status, responseTime }).catch(() => {});
    return originalJson(body);
  };

  next();
}

async function notify({ req, ip, status, responseTime }) {
  const params = {
    ...req.query,
    ...( typeof req.body === 'object' ? req.body : {} )
  };
  const paramStr = Object.keys(params).length
    ? Object.entries(params).map(([k, v]) => `${k}=${String(v).slice(0, 50)}`).join(', ')
    : '-';

  const emoji = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢';

  await sendMessage(
    `${emoji} <b>API Hit</b>\n\n` +
    `🔗 <b>Endpoint:</b> <code>${req.method} ${req.path}</code>\n` +
    `🌐 <b>IP:</b> <code>${ip}</code>\n` +
    `📦 <b>Params:</b> <code>${paramStr}</code>\n` +
    `📊 <b>Status:</b> <code>${status}</code>\n` +
    `⚡ <b>Response Time:</b> <code>${responseTime}ms</code>\n` +
    `🕐 <b>Waktu:</b> <code>${new Date().toISOString()}</code>`,
    CHAT_ID
  );
}
