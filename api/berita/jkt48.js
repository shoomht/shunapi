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
import __got_1 from 'got';
const got_1 = { default: __got_1 };
import * as cheerio from 'cheerio';
async function scrapeJKT48News() {
    try {
        const response = await (0, got_1.default)("https://jkt48.com/news/list?lang=id", {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
            },
            timeout: {
                request: 30000
            },
            retry: {
                limit: 3,
                methods: ["GET"],
                statusCodes: [408, 413, 429, 500, 502, 503, 504],
                errorCodes: [
                    "ETIMEDOUT",
                    "ECONNRESET",
                    "EADDRINUSE",
                    "ECONNREFUSED",
                    "EPIPE",
                    "ENOTFOUND",
                    "ENETUNREACH",
                    "EAI_AGAIN",
                ],
                calculateDelay: (retryObject) => {
                    return Math.min(1000 * Math.pow(2, retryObject.attemptCount), 10000);
                },
            },
        });
        const $ = cheerio.load(response.body);
        const results = [];
        $(".entry-news__list").each((_, element) => {
            const $item = $(element);
            if ($item.hasClass("entry-news__list--pagination"))
                return;
            const title = $item.find(".entry-news__list--item h3 a").text().trim();
            const link = "https://jkt48.com" + $item.find(".entry-news__list--item h3 a").attr("href");
            const date = $item.find(".entry-news__list--item time").text().trim();
            const icon = "https://jkt48.com" + $item.find(".entry-news__list--label img").attr("src");
            if (title && link) {
                results.push({
                    title,
                    link,
                    date,
                    icon,
                });
            }
        });
        return results;
    }
    catch (error) {
        console.error("Error scraping JKT48 News:", error);
        throw new Error(error.message || "Failed to scrape JKT48 News");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/berita/jkt48",
        name: "jkt48 news",
        category: "Berita",
        description: "This API endpoint allows you to fetch the latest news from the official JKT48 website.",
        tags: ["BERITA", "NEWS", "JKT48", "ENTERTAINMENT", "INDONESIA"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrapeJKT48News();
                if (data.length === 0) {
                    return {
                        status: false,
                        error: "No news found",
                        code: 404,
                    };
                }
                return {
                    status: true,
                    data,
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
