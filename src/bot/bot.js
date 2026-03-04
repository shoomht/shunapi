import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const API_DIR = path.join(process.cwd(), 'api');
const ROOT_DIR = process.cwd();

// ── Telegram API ──────────────────────────────────────────────────────────────

function tgRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(params);
    const opts = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function sendMessage(text, chatId = CHAT_ID) {
  if (!BOT_TOKEN || !chatId) return;
  try {
    await tgRequest('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });
  } catch (e) {
    console.error('[BOT] sendMessage error:', e.message);
  }
}

async function sendDocument(filePath, caption = '', chatId = CHAT_ID) {
  if (!BOT_TOKEN || !chatId) return;
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const boundary = '----Boundary' + Date.now();
    const meta = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`
    );
    const end = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([meta, fileContent, end]);
    const opts = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendDocument`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function downloadFile(fileId, destPath) {
  const res = await tgRequest('getFile', { file_id: fileId });
  if (!res.ok) throw new Error('Gagal getFile dari Telegram');
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${res.result.file_path}`;
    const file = fs.createWriteStream(destPath);
    https.get(url, r => {
      r.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(destPath, () => {}); reject(err); });
  });
}

// ── Pure Node.js ZIP ──────────────────────────────────────────────────────────

function u16LE(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function u32LE(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; }

function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files) {
  const entries = [];
  const central = [];
  let offset = 0;
  const d = new Date();
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);

  for (const { name, data } of files) {
    const nameB = Buffer.from(name);
    const compressed = zlib.deflateRawSync(data, { level: 6 });
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      Buffer.from([0x50, 0x4B, 0x03, 0x04]),
      u16LE(20), u16LE(0), u16LE(8),
      u16LE(time), u16LE(date),
      u32LE(crc), u32LE(compressed.length), u32LE(data.length),
      u16LE(nameB.length), u16LE(0), nameB,
    ]);
    entries.push(localHeader, compressed);
    central.push(Buffer.concat([
      Buffer.from([0x50, 0x4B, 0x01, 0x02]),
      u16LE(20), u16LE(20), u16LE(0), u16LE(8),
      u16LE(time), u16LE(date),
      u32LE(crc), u32LE(compressed.length), u32LE(data.length),
      u16LE(nameB.length), u16LE(0), u16LE(0), u16LE(0), u16LE(0), u32LE(0), u32LE(offset),
      nameB,
    ]));
    offset += localHeader.length + compressed.length;
  }

  const centralBuf = Buffer.concat(central);
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4B, 0x05, 0x06]),
    u16LE(0), u16LE(0),
    u16LE(central.length), u16LE(central.length),
    u32LE(centralBuf.length), u32LE(offset), u16LE(0),
  ]);
  return Buffer.concat([...entries, centralBuf, eocd]);
}

function collectFiles(dir, base = '') {
  const result = [];
  const SKIP = ['node_modules', '.git', '.vercel'];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.includes(entry.name) || entry.name === '.env' || entry.name.endsWith('.log')) continue;
    const fullPath = path.join(dir, entry.name);
    const relName = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      result.push(...collectFiles(fullPath, relName));
    } else {
      try { result.push({ name: relName, data: fs.readFileSync(fullPath) }); } catch {}
    }
  }
  return result;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleHelp(chatId) {
  await sendMessage(
    `🤖 <b>REST API Manager Bot</b>\n\n` +
    `<b>Perintah:</b>\n` +
    `/list — Lihat semua endpoint aktif\n` +
    `/delete &lt;kategori/nama&gt; — Hapus endpoint\n` +
    `/backup — Kirim backup zip source code\n` +
    `/help — Tampilkan bantuan ini\n\n` +
    `<b>Tambah Endpoint:</b>\n` +
    `Kirim file <code>.js</code> langsung ke bot.\n` +
    `Format nama: <code>kategori_nama.js</code>\n` +
    `Contoh: <code>ai_gpt.js</code> → <code>api/ai/gpt.js</code>\n` +
    `Atau: <code>gpt.js</code> → <code>api/gpt.js</code>`,
    chatId
  );
}

async function handleList(chatId) {
  const categories = {};
  let total = 0;
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { scan(full); }
      else if (entry.name.endsWith('.js')) {
        const cat = path.relative(API_DIR, dir) || 'root';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(entry.name.replace('.js', ''));
        total++;
      }
    }
  }
  scan(API_DIR);
  if (total === 0) return sendMessage('📭 Tidak ada endpoint aktif.', chatId);
  let msg = `📋 <b>Endpoint Aktif (${total} total)</b>\n\n`;
  for (const [cat, files] of Object.entries(categories)) {
    msg += `📁 <b>${cat}</b>\n`;
    files.forEach(f => { msg += `  • ${f}\n`; });
    msg += '\n';
  }
  await sendMessage(msg, chatId);
}

async function handleDelete(chatId, args) {
  if (!args) return sendMessage('❌ Format: /delete &lt;kategori/nama&gt;\nContoh: /delete ai/gpt', chatId);
  const target = args.endsWith('.js') ? args : args + '.js';
  const fullPath = path.join(API_DIR, target);
  if (!fs.existsSync(fullPath)) return sendMessage(`❌ File tidak ditemukan: <code>${target}</code>`, chatId);
  fs.unlinkSync(fullPath);
  
  setTimeout(() => process.exit(0), 1000);
}

async function handleBackup(chatId) {
  await sendMessage('⏳ Membuat backup...', chatId);
  try {
    const files = collectFiles(ROOT_DIR);
    const zipBuf = buildZip(files);
    const zipPath = `/tmp/backup-${Date.now()}.zip`;
    fs.writeFileSync(zipPath, zipBuf);
    const sizeMB = (zipBuf.length / 1024 / 1024).toFixed(2);
    await sendDocument(zipPath, `📦 Backup REST API\n🕐 ${new Date().toISOString()}\n📦 ${sizeMB} MB\n📄 ${files.length} files`, chatId);
    fs.unlinkSync(zipPath);
  } catch (err) {
    await sendMessage(`❌ Backup gagal: ${err.message}`, chatId);
  }
}

async function handleAddFile(chatId, document) {
  const fileName = document.file_name;
  if (!fileName.endsWith('.js')) return sendMessage('❌ Hanya file .js yang diterima.', chatId);
  await sendMessage(`⏳ Mengunduh <code>${fileName}</code>...`, chatId);
  try {
    const nameNoExt = fileName.replace('.js', '');
    let destPath;
    if (nameNoExt.includes('_')) {
      const [cat, ...rest] = nameNoExt.split('_');
      const name = rest.join('_');
      const catDir = path.join(API_DIR, cat);
      if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
      destPath = path.join(catDir, `${name}.js`);
    } else {
      destPath = path.join(API_DIR, fileName);
    }
    await downloadFile(document.file_id, destPath);
    const rel = path.relative(API_DIR, destPath);
    await sendMessage(`✅ Endpoint ditambahkan!\n\n📄 <code>api/${rel}</code>\n✅ Langsung aktif tanpa restart!`, chatId);
  } catch (err) {
    await sendMessage(`❌ Gagal: ${err.message}`, chatId);
  }
}

// ── Update processor ──────────────────────────────────────────────────────────

export async function processUpdate(update) {
  const msg = update.message;
  if (!msg) return;
  const chatId = String(msg.chat.id);
  if (chatId !== String(CHAT_ID)) return sendMessage('⛔ Tidak diizinkan.', chatId);
  if (msg.document) return handleAddFile(chatId, msg.document);
  const text = msg.text || '';
  const [cmd, ...rest] = text.trim().split(' ');
  const args = rest.join(' ').trim();
  switch (cmd.toLowerCase()) {
    case '/start':
    case '/help': return handleHelp(chatId);
    case '/list': return handleList(chatId);
    case '/delete': return handleDelete(chatId, args);
    case '/backup': return handleBackup(chatId);
    default:
      if (text.startsWith('/')) await sendMessage('❓ Perintah tidak dikenal. Ketik /help.', chatId);
  }
}

// ── Register webhook ──────────────────────────────────────────────────────────

export async function startBot() {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[BOT] Bot tidak aktif — set TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID di .env');
    return;
  }
  if (!WEBHOOK_URL) {
    console.warn('[BOT] WEBHOOK_URL belum diset di .env');
    return;
  }
  try {
    const webhookPath = `${WEBHOOK_URL}/webhook/telegram`;
    const res = await tgRequest('setWebhook', { url: webhookPath });
    if (res.ok) {
      console.log(`[BOT] Webhook terdaftar: ${webhookPath}`);
    } else {
      console.error('[BOT] Gagal daftar webhook:', res.description);
    }
  } catch (e) {
    console.error('[BOT] startBot error:', e.message);
  }
}
