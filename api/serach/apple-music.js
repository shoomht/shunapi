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
async function scrapeMusicApple(query, region) {
    try {
        const res = await axios_1.default.get(`https://music.apple.com/${region}/search?term=${encodeURIComponent(query)}`, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(res.data);
        const results = [];
        $(".top-search-lockup").each((index, element) => {
            const title = $(element)
                .find(".top-search-lockup__primary__title")
                .text()
                .trim();
            const artist = $(element)
                .find(".top-search-lockup__secondary")
                .text()
                .trim();
            const link = $(element).find(".click-action").attr("href");
            const image = $(element)
                .find("picture source")
                .attr("srcset")
                ?.split(" ")[0];
            if (title && artist && link) {
                results.push({
                    title,
                    artist,
                    link: link.startsWith("http")
                        ? link
                        : `https://music.apple.com${link}`,
                    image: image || null,
                });
            }
        });
        return { result: results };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/s/applemusic",
        name: "music apple",
        category: "Search",
        description: "This API endpoint allows users to search for music on Apple Music.",
        tags: ["Search", "Music", "Apple Music"],
        example: "?query=duka&region=id",
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
                description: "Music search query",
                example: "duka",
            },
            {
                name: "region",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    pattern: "^[a-z]{2}$",
                    default: "us",
                    minLength: 2,
                    maxLength: 2,
                },
                description: "Two-letter country code",
                example: "id",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query, region = "us" } = req.query || {};
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
            if (typeof region !== "string" || !/^[a-z]{2}$/.test(region.trim())) {
                return {
                    status: false,
                    error: "Invalid region format. Use two-letter country codes (e.g., 'us', 'id').",
                    code: 400,
                };
            }
            try {
                const data = await scrapeMusicApple(query.trim(), region.trim());
                if (!data) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: data.result,
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
