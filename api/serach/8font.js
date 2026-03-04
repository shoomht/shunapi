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
async function scrape8Font(query, page) {
    try {
        const headers = {
            "Accept": "*/*",
            "User-Agent": "Postify/1.0.0",
            "Content-Encoding": "gzip, deflate, br, zstd",
            "Content-Type": "application/json",
        };
        const { data } = await axios_1.default.get(`https://8font.com/page/${page || 1}/?s=${encodeURIComponent(query)}`, {
            headers,
            timeout: 30000,
        });
        const $ = cheerio.load(data);
        const fonts = $(".card-body")
            .map((_, el) => ({
            title: $(el).find(".entry-title a").text(),
            link: $(el).find(".btn-primary").attr("href"),
            categories: $(el)
                .find(".post-info a")
                .map((_, e) => $(e).text())
                .get(),
            date: $(el).find(".post-info").contents().first().text().trim(),
            image: $(el).closest(".card").find("img").attr("src"),
        }))
            .get();
        return fonts.length
            ? { status: true, fonts }
            : { status: false, message: "No fonts found" };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/s/8font",
        name: "8 font",
        category: "Search",
        description: "This API endpoint allows you to search for fonts available on 8font.com.",
        tags: ["Search", "Font", "8font"],
        example: "?query=cartoon&page=1",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "Search query",
                example: "cartoon",
            },
            {
                name: "page",
                in: "query",
                required: false,
                schema: {
                    type: "integer",
                    minimum: 1,
                    default: 1,
                },
                description: "Page number",
                example: 1,
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query, page } = req.query || {};
            if (!query) {
                return {
                    status: false,
                    error: "Query parameter is required",
                    code: 400,
                };
            }
            if (typeof query !== "string" || query.trim().length === 0) {
                return {
                    status: false,
                    error: "Query must be a non-empty string",
                    code: 400,
                };
            }
            if (query.length > 255) {
                return {
                    status: false,
                    error: "Query must be less than 255 characters",
                    code: 400,
                };
            }
            const pageNumber = page ? parseInt(page) : 1;
            if (isNaN(pageNumber) || pageNumber < 1) {
                return {
                    status: false,
                    error: "Page must be a positive integer",
                    code: 400,
                };
            }
            try {
                const result = await scrape8Font(query.trim(), pageNumber);
                if (!result) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: result.fonts,
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
