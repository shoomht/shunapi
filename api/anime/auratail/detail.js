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
async function scrapeDetail(url) {
    try {
        const { data } = await axios_1.default.get(proxy() + url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        const result = {
            title: $('.entry-title[itemprop="name"]').text().trim(),
            image: $('.thumb img[itemprop="image"]').attr('data-src') ||
                $('.thumb img[itemprop="image"]').attr('src'),
            status: $('span:contains("Status:")')
                .text()
                .replace('Status:', '')
                .trim(),
            studio: $('span:contains("Studio:")')
                .text()
                .replace('Studio:', '')
                .trim(),
            episodes: $('span:contains("Episodes:")')
                .text()
                .replace('Episodes:', '')
                .trim(),
            duration: $('span:contains("Duration:")')
                .text()
                .replace('Duration:', '')
                .trim(),
            type: $('span:contains("Type:")').text().replace('Type:', '').trim(),
            releaseYear: $('span:contains("Released:")')
                .text()
                .replace('Released:', '')
                .trim(),
            producers: $('span:contains("Producers:")')
                .nextUntil('span')
                .map((_, el) => $(el).text().trim())
                .get()
                .join(', '),
            genres: $('.genxed a')
                .map((_, el) => $(el).text().trim())
                .get()
                .join(', '),
            synopsis: $('.entry-content[itemprop="description"] p')
                .map((_, el) => $(el).text().trim())
                .get()
                .join('\n'),
        };
        return result;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/anime/auratail-detail",
        name: "auratail detail",
        category: "Anime",
        description: "This API endpoint allows you to retrieve detailed information about an anime from Auratail by providing its URL.",
        tags: ["ANIME", "Scraping", "Detail"],
        example: "?url=https://auratail.vip/the-war-of-cards/",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                },
                description: "Anime detail page URL",
                example: "https://auratail.vip/the-war-of-cards/",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { url } = req.query || {};
            if (!url) {
                return {
                    status: false,
                    error: "URL parameter is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "URL parameter must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrapeDetail(url.trim());
                return {
                    status: true,
                    data: result,
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
