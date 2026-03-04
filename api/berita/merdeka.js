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
async function scrapeMerdekaNews() {
    try {
        const response = await (0, got_1.default)("https://www.merdeka.com/peristiwa/", {
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
        $(".box-headline ul li.item").each((_, element) => {
            const $item = $(element);
            const title = $item.find(".item-title a").text().trim();
            let link = $item.find(".item-title a").attr("href");
            let image = $item.find(".item-img img").attr("src");
            const category = $item.find(".item-tag").text().trim();
            const date = $item.find(".item-date").text().trim();
            const description = $item.find(".item-description").text().trim();
            if (image && !image.startsWith("http")) {
                image = "https://www.merdeka.com" + image;
            }
            if (link && !link.startsWith("http")) {
                link = "https://www.merdeka.com" + link;
            }
            if (title && link) {
                results.push({
                    title,
                    link,
                    image,
                    category,
                    date,
                    description,
                });
            }
        });
        return results;
    }
    catch (error) {
        console.error("Error scraping Merdeka News:", error);
        throw new Error(error.message || "Failed to scrape Merdeka News");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/berita/merdeka",
        name: "merdeka news",
        category: "Berita",
        description: "This API endpoint allows you to retrieve the latest news headlines from Merdeka.com, specifically from its 'Peristiwa...",
        tags: ["BERITA", "NEWS", "INDONESIA", "CURRENT EVENTS"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrapeMerdekaNews();
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
