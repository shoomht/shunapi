var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import * as cheerio from 'cheerio';
async function scrapeMcpedlSearch(query, max = 10) {
    try {
        const { data } = await axios_1.default.get(`https://mcpedl.org/?s=${encodeURIComponent(query)}`, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        const result = [];
        $(".g-block.size-20 article").each((i, el) => {
            if (i >= max) {
                return;
            }
            const title = $(el).find(".entry-title a").text().trim() || "No title";
            const link = $(el).find(".entry-title a").attr("href") || "No link";
            let image = $(el).find(".post-thumbnail img").attr("data-srcset") || $(el).find(".post-thumbnail img").attr("src") || "No image";
            if (image.includes(",")) {
                image = image.split(",")[0].split(" ")[0];
            }
            const rating = $(el).find(".rating-wrapper span").text().trim() || "No rating";
            result.push({ title, link, image, rating });
        });
        return {
            status: true,
            data: result,
        };
    }
    catch (error) {
        console.error("Error during MCPEDL search:", error.message);
        throw new Error("Failed to search MCPEDL.");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/s/mcpedl",
        name: "mcpedlsearch",
        category: "Search",
        description: "This API endpoint allows users to search for Minecraft Pocket Edition (MCPE) content on MCPEDL.org using a search query.",
        tags: ["Search", "Minecraft", "MCPE"],
        example: "?q=shaders",
        parameters: [
            {
                name: "q",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "The search query for MCPEDL",
                example: "shaders",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { q } = req.query || {};
            if (!q) {
                return {
                    status: false,
                    error: "Query parameter is required",
                    code: 400,
                };
            }
            if (typeof q !== "string" || q.trim().length === 0) {
                return {
                    status: false,
                    error: "Query must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const data = await scrapeMcpedlSearch(q.trim());
                return {
                    status: true,
                    data: data.data,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    }
];
