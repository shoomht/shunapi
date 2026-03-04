import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

// Cache: route -> { handler, info, mtime }
const routeCache = new Map();
// Endpoint info list untuk openapi.json
const endpointList = new Map(); // key: routeKey -> endpointInfo

function getRoutePath(filePath) {
  return "/api" + filePath
    .replace(path.join(process.cwd(), "api"), "")
    .replace(/\.js$/, "")
    .replace(/\\/g, "/");
}

function scanFiles(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...scanFiles(full));
    else if (entry.name.endsWith(".js")) result.push(full);
  }
  return result;
}

async function loadFile(filePath) {
  const stat = fs.statSync(filePath);
  const mtime = stat.mtimeMs;
  const cacheKey = filePath;

  // Return cache kalau file belum berubah
  if (routeCache.has(cacheKey) && routeCache.get(cacheKey).mtime === mtime) {
    return routeCache.get(cacheKey).handlers;
  }

  try {
    // Bust cache ESM dengan timestamp
    const mod = (await import(pathToFileURL(filePath).href + "?t=" + mtime)).default;
    const handlers = [];

    // Format native (object dengan run)
    if (mod && typeof mod.run === "function") {
      const routePath = getRoutePath(filePath);
      const methods = mod.methods || ["GET"];
      for (const method of methods) {
        handlers.push({
          method: method.toUpperCase(),
          route: routePath,
          run: (req, res) => mod.run(req, res),
          info: {
            name: mod.name || path.basename(filePath, ".js"),
            description: mod.description || "",
            category: mod.category || "General",
            route: routePath,
            methods,
            params: mod.params || [],
            paramsSchema: mod.paramsSchema || {},
          }
        });
      }
    }

    // Format legacy array
    if (Array.isArray(mod)) {
      for (const def of mod) {
        if (!def || typeof def !== "object") continue;
        const method = (def.metode || def.method || "GET").toUpperCase();
        let routePath = (def.endpoint || "").toString();
        if (!routePath.startsWith("/")) routePath = "/" + routePath;
        if (!routePath.startsWith("/api")) routePath = "/api" + routePath;

        handlers.push({
          method,
          route: routePath,
          run: async (req, res) => {
            try {
              const result = await def.run?.({ req, res });
              if (res.headersSent) return;
              if (result && typeof result === "object") {
                const ok = result.status === undefined ? true : !!result.status;
                const code = Number(result.code || (ok ? 200 : 400));
                if (!ok) return res.status(code).json({ success: false, error: result.error || result.message || "Request failed" });
                return res.status(code).json({ results: result.data !== undefined ? result.data : result });
              }
              return res.status(200).json({ results: result });
            } catch (e) {
              return res.status(500).json({ success: false, error: e?.message || "Internal server error" });
            }
          },
          info: {
            name: def.name || path.basename(filePath, ".js"),
            description: def.description || "",
            category: def.category || "General",
            route: routePath,
            methods: [method],
            params: Array.isArray(def.parameters) ? def.parameters.map(p => p?.name).filter(Boolean) : (def.params || []),
            paramsSchema: def.paramsSchema || {},
          }
        });
      }
    }

    routeCache.set(cacheKey, { mtime, handlers });
    return handlers;
  } catch (e) {
    console.error(`Error loading endpoint ${filePath}:`, e.message);
    return [];
  }
}

export default async function loadEndpoints(dir, app) {
  // Daftarkan 1 middleware catch-all untuk semua /api/*
  app.all("/api/*", async (req, res, next) => {
    const method = req.method.toUpperCase();
    const reqPath = req.path;

    // Cari file yang cocok dengan request path
    const files = scanFiles(dir);

    for (const filePath of files) {
      const handlers = await loadFile(filePath);
      for (const h of handlers) {
        if (h.method === method && h.route === reqPath) {
          return h.run(req, res);
        }
      }
    }

    // Tidak ketemu
    return res.status(404).json({ success: false, error: "Endpoint not found" });
  });

  // Load semua endpoint untuk openapi.json
  const allEndpoints = [];
  const seen = new Set();
  const files = scanFiles(dir);

  for (const filePath of files) {
    const handlers = await loadFile(filePath);
    for (const h of handlers) {
      const key = `${h.method} ${h.route}`;
      if (!seen.has(key)) {
        seen.add(key);
        allEndpoints.push(h.info);
        console.log(`• endpoint loaded: ${h.route} [${h.method}]`);
      }
    }
  }

  return allEndpoints;
}

// Export fungsi untuk refresh list endpoint (dipanggil dari openapi.json)
export async function getEndpoints(dir) {
  const allEndpoints = [];
  const seen = new Set();
  const files = scanFiles(dir);
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    const handlers = await loadFile(filePath);
    for (const h of handlers) {
      const key = `${h.method} ${h.route}`;
      if (!seen.has(key)) {
        seen.add(key);
        allEndpoints.push(h.info);
      }
    }
  }
  return allEndpoints;
}
