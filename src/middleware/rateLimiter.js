import 'dotenv/config';

const WINDOW_MS = 10 * 1000;
const MAX_REQUESTS = 25;
const CLEANUP_INTERVAL_MS = 60 * 1000;

const ipTimestamps = new Map();
let banned = {};

function cleanup() {
  const now = Date.now();
  for (const [ip, arr] of ipTimestamps.entries()) {
    const filtered = arr.filter((t) => now - t <= WINDOW_MS);
    if (filtered.length === 0) ipTimestamps.delete(ip);
    else ipTimestamps.set(ip, filtered);
  }
}

setInterval(cleanup, CLEANUP_INTERVAL_MS);

function banIp(ip, reason = "rate_limit_exceeded") {
  const now = new Date().toISOString();
  banned[ip] = { bannedAt: now, reason, by: "rateLimiter" };
  console.log(`[BAN] ${now} ${ip} reason=${reason}`);
}

function unbanIp(ip) {
  if (banned[ip]) {
    const now = new Date().toISOString();
    delete banned[ip];
    console.log(`[UNBAN] ${now} ${ip}`);
    return true;
  }
  return false;
}

function rateLimiterMiddleware(options = {}) {
  const maxReq = options.maxRequests || MAX_REQUESTS;
  const windowMs = options.windowMs || WINDOW_MS;

  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown";

    if (banned[ip]) {
      const info = banned[ip];
      return res.status(403).json({
        success: false,
        error: "Your IP has been blocked due to abuse or rate limit violations.",
        note: "Contact the owner to request unblocking.",
        bannedAt: info.bannedAt,
        reason: info.reason,
      });
    }

    const now = Date.now();
    const arr = ipTimestamps.get(ip) || [];
    arr.push(now);
    const recent = arr.filter((t) => now - t <= windowMs);
    ipTimestamps.set(ip, recent);

    if (recent.length > maxReq) {
      banIp(ip, `exceeded_${maxReq}_per_${windowMs}ms`);
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded - your IP has been blocked. Max ${maxReq} requests per ${windowMs/1000}s.`,
        note: "Contact the owner to request unblocking.",
      });
    }

    next();
  };
}

function adminUnbanHandler(req, res) {
  const adminKey = process.env.ADMIN_KEY || null;
  const provided = req.headers["x-admin-key"] || req.body?.adminKey || req.query?.adminKey;

  if (!adminKey) return res.status(500).json({ success: false, error: "ADMIN_KEY not configured on server." });
  if (!provided || provided !== adminKey) return res.status(401).json({ success: false, error: "Unauthorized." });

  const { ip } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: "Provide ip in request body to unban." });

  const ok = unbanIp(ip);
  if (ok) return res.json({ success: true, message: `IP ${ip} unbanned.` });
  return res.status(404).json({ success: false, error: `IP ${ip} not found in ban list.` });
}

function getBannedList() { return banned; }
function getStats() {
  return { activeIps: ipTimestamps.size, bannedCount: Object.keys(banned).length };
}

export default { middleware: rateLimiterMiddleware(), adminUnbanHandler, getBannedList, getStats, banIp, unbanIp };
