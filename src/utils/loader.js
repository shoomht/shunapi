import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Recursively loads and registers API endpoints from a directory structure
 * @async
 * @function loadEndpoints
 * @param {string} dir - The directory path to scan for endpoint files
 * @param {express.Application} app - Express application instance to register routes
 * @returns {Promise<Array<Object>>} Array of loaded endpoint metadata objects
 * 
 * @description
 * This function recursively scans a directory for JavaScript files that export endpoint modules.
 * Each endpoint file should export a default object with a `run` function and optional metadata.
 * Discovered endpoints are automatically registered with the Express application.
 * 
 * @example
 * // Load endpoints from the api directory
 * const endpoints = await loadEndpoints(path.join(process.cwd(), "api"), app);
 * console.log(`Loaded ${endpoints.length} endpoints`);
 * 
 * @fileStructure
 * api/
 * ├── users/
 * │   ├── get.js          // GET /api/users/get
 * │   └── create.js       // POST /api/users/create
 * └── products/
 *     └── list.js         // GET /api/products/list
 * 
 * @endpointModuleFormat
 * // Example endpoint file (api/users/get.js)
 * export default {
 *   name: "Get User",
 *   description: "Retrieves user information by ID",
 *   category: "Users",
 *   methods: ["GET"],
 *   params: ["userId"],
 *   run: async (req, res) => {
 *     // Endpoint logic here
 *   }
 * }
 */
export default async function loadEndpoints(dir, app) {
  // Keep a process-wide registry to avoid duplicate route registration
  // (can happen when legacy modules export arrays with duplicated entries)
  const registered = new Set();

  async function _load(dirPath) {
  /**
   * Read directory contents synchronously
   * @type {Array<fs.Dirent>}
   */
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  /**
   * Array to collect endpoint metadata
   * @type {Array<Object>}
   */
  const endpoints = [];

  // Process each file/directory in the current directory
  for (const file of files) {
    /**
     * Full path to the current file/directory
     * @type {string}
     */
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      /**
       * Recursively load endpoints from subdirectory
       * @type {Array<Object>}
       */
      const subEndpoints = await _load(fullPath);
      endpoints.push(...subEndpoints);
    } else if (file.isFile() && file.name.endsWith(".js")) {
      try {
        /**
         * Dynamically import the endpoint module
         * @type {Object}
         */
        const modDefault = (await import(pathToFileURL(fullPath))).default;

        // ------------------------------------------------------------------
        // 1) Native endpoint format (this boilerplate)
        // ------------------------------------------------------------------
        if (modDefault && (typeof modDefault.run === "function" || Array.isArray(modDefault.run))) {
          /**
           * Generate the route path from the file system structure
           * @type {string}
           * @example
           * // File: /project/api/users/get.js
           * // Route: /api/users/get
           */
          const routePath = "/api" + fullPath
            .replace(path.join(process.cwd(), "api"), "")
            .replace(/\.js$/, "")
            .replace(/\\/g, "/");

          /**
           * Supported HTTP methods for this endpoint
           * @type {Array<string>}
           * @default ["GET"]
           */
          const methods = modDefault.methods || ["GET"];

          // Register each HTTP method with Express
          for (const method of methods) {
            /**
             * Register the route with Express
             * @param {string} routePath - The URL path for the endpoint
             * @param {Function} handler - The endpoint handler function
             */
            if (Array.isArray(modDefault.run)) {
              const key = `${method.toUpperCase()} ${routePath}`;
              if (registered.has(key)) continue;
              registered.add(key);
              app[method.toLowerCase()](routePath, ...modDefault.run);
            } else {
              const key = `${method.toUpperCase()} ${routePath}`;
              if (registered.has(key)) continue;
              registered.add(key);
              app[method.toLowerCase()](routePath, (req, res) => modDefault.run(req, res));
            }
          }

          // Log successful endpoint loading
          console.log(`• endpoint loaded: ${routePath} [${methods.join(", ")}]`);

          /**
           * Endpoint metadata object for documentation
           * @type {Object}
           */
          const endpointInfo = {
            name: modDefault.name || path.basename(file.name, '.js'),
            description: modDefault.description || "",
            category: modDefault.category || "General",
            route: routePath,
            methods,
            params: modDefault.params || [],
            paramsSchema: modDefault.paramsSchema || {},
          };

          endpoints.push(endpointInfo);

          // Native module handled; move to next file
          continue;
        }

        // ------------------------------------------------------------------
        // 2) Legacy endpoint format (api.zip) – exported as an Array
        // ------------------------------------------------------------------
        if (Array.isArray(modDefault)) {
          for (const def of modDefault) {
            if (!def || typeof def !== "object") continue;
            const method = (def.metode || def.method || "GET").toString().toUpperCase();
            let routePath = (def.endpoint || "").toString();
            if (!routePath.startsWith("/")) routePath = "/" + routePath;
            if (!routePath.startsWith("/api")) routePath = "/api" + routePath;

            const key = `${method} ${routePath}`;
            if (registered.has(key)) continue;
            registered.add(key);

            app[method.toLowerCase()](routePath, async (req, res) => {
              try {
                const result = await def.run?.({ req, res });
                if (res.headersSent) return;

                // If legacy handler already returns a response object, normalize it
                if (result && typeof result === "object") {
                  const ok = result.status === undefined ? true : !!result.status;
                  const code = Number(result.code || (ok ? 200 : 400));

                  if (!ok) {
                    return res.status(code).json({
                      success: false,
                      error: result.error || result.message || "Request failed",
                    });
                  }

                  // Prefer `data` but fall back to the whole object
                  return res.status(code).json({
                    results: result.data !== undefined ? result.data : result,
                  });
                }

                // Primitive / empty return
                return res.status(200).json({ results: result });
              } catch (error) {
                return res.status(500).json({
                  success: false,
                  error: error?.message || "Internal server error",
                });
              }
            });

            // Documentation entry
            const params = Array.isArray(def.parameters)
              ? def.parameters.map((p) => p?.name).filter(Boolean)
              : [];

            endpoints.push({
              name: def.name || path.basename(file.name, ".js"),
              description: def.description || "",
              category: def.category || "General",
              route: routePath,
              methods: [method],
              params,
              paramsSchema: def.paramsSchema || {},
            });
          }
        }
      } catch (error) {
        console.error(`Error loading endpoint ${fullPath}:`, error);
      }
    }
  }

  return endpoints;
  }

  return await _load(dir);
}