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
async function scrapeLatestNews() {
    try {
        const response = await axios_1.default.get("https://www.sindonews.com/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(response.data);
        const articles = [];
        $(".list-article").each((index, element) => {
            const title = $(element).find(".title-article").text().trim();
            const link = $(element).find("a").attr("href");
            const category = $(element).find(".sub-kanal").text().trim();
            const timestamp = $(element).find(".date-article").text().trim();
            const imageUrl = $(element).find("img.lazyload").attr("data-src");
            if (title && link) {
                articles.push({
                    title,
                    link,
                    category,
                    timestamp,
                    imageUrl,
                });
            }
        });
        return articles;
    }
    catch (error) {
        console.error("Error scraping Sindonews:", error.message);
        throw new Error(error.message || "Failed to scrape Sindonews");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/berita/sindonews",
        name: "sindonews",
        category: "Berita",
        description: "This API endpoint provides access to the latest news headlines from Sindonews.com, a major Indonesian news portal.",
        tags: ["BERITA", "NEWS", "INDONESIA", "CURRENT EVENTS"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrapeLatestNews();
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
