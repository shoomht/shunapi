import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { startBot, processUpdate } from '../bot/bot.js';
import telegramNotif from '../middleware/telegramNotif.js';
import logger from "../utils/logger.js";
import loadEndpoints, { getEndpoints } from "../utils/loader.js";
import setupMiddleware from "../middleware/index.js";
import setupResponseFormatter from "./responseFormatter.js";
import rateLimiter from '../middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const API_DIR = path.join(process.cwd(), "api");

app.set("trust proxy", true);
app.set("json spaces", 2);

setupMiddleware(app);
setupResponseFormatter(app);
app.use(telegramNotif);

// Webhook Telegram
app.post('/webhook/telegram', express.json(), async (req, res) => {
  res.sendStatus(200);
  try {
    await processUpdate(req.body);
  } catch (e) {
    console.error('[WEBHOOK] error:', e.message);
  }
});

let isReady = false;

const initPromise = (async function initializeAPI() {
  logger.info("Starting server initialization...");
  logger.info("Loading API endpoints...");

  await loadEndpoints(API_DIR, app);

  logger.ready(`Endpoints loaded`);
  isReady = true;
  startBot();
})();

app.use(async (req, res, next) => {
  if (!isReady) await initPromise;
  next();
});

// OpenAPI - selalu realtime dari file
app.get("/openapi.json", async (req, res) => {
  const baseURL = `${req.protocol}://${req.get("host")}`;
  const endpoints = await getEndpoints(API_DIR);
  const enriched = endpoints.map((ep) => {
    let url = baseURL + ep.route;
    if (ep.params && ep.params.length > 0) {
      const query = ep.params.map((p) => `${p}=YOUR_${p.toUpperCase()}`).join("&");
      url += "?" + query;
    }
    return { ...ep, url };
  });
  res.status(200).json({
    title: "InuSoft API's.",
    description: "Welcome to the API documentation. This interactive interface allows you to explore and test our API endpoints in real-time.",
    baseURL,
    endpoints: enriched,
  });
});

app.post("/admin/unban", express.json(), rateLimiter.adminUnbanHandler);

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  logger.info(`404: ${req.method} ${req.path}`);
  res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
});

app.use((err, req, res, next) => {
  logger.error(`500: ${err.message}`);
  res.status(500).sendFile(path.join(process.cwd(), 'public', '500.html'));
});

export default app;
