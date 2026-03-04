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
async function scrapeBrave(query) {
    try {
        const response = await axios_1.default.get(`https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(response.data);
        const results = [];
        $(".snippet").each((i, element) => {
            const result = {
                title: $(element).find(".title").text().trim(),
                description: $(element).find(".snippet-description").text().trim(),
                url: $(element).find(".h").attr("href"),
                imageUrl: $(element).find(".thumbnail img").attr("src"),
                siteName: $(element).find(".sitename").text().trim(),
                date: $(element)
                    .find(".snippet-description")
                    .text()
                    .split("-")[0]
                    .trim(),
            };
            Object.keys(result).forEach((key) => {
                if (!result[key]) {
                    delete result[key];
                }
            });
            if (Object.keys(result).length > 1) {
                results.push(result);
            }
        });
        const metadata = {
            totalResults: results.length,
            searchQuery: query,
            timestamp: new Date().toISOString(),
        };
        return { metadata, results };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/s/brave",
        name: "brave",
        category: "Search",
        description: "This API endpoint performs a web search using the Brave search engine.",
        tags: ["Search", "Brave", "Web"],
        example: "?query=apa itu nodejs",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 500,
                },
                description: "The search query",
                example: "apa itu nodejs",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query } = req.query || {};
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
            if (query.length > 500) {
                return {
                    status: false,
                    error: "Query must be less than 500 characters",
                    code: 400,
                };
            }
            try {
                const data = await scrapeBrave(query.trim());
                return {
                    status: true,
                    data: data,
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
