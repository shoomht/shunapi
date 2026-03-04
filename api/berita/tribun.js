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
const base_url = "https://www.tribunnews.com";
async function scrapeTribunNews() {
    try {
        const response = await (0, got_1.default)(base_url, {
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
        let result = [];
        const isi = $("li.art-list.pos_rel");
        isi.each((i, e) => {
            const title = $(e).children("div.mr140").children("h3").children("a").text().trim();
            const link = $(e).children("div.mr140").children("h3").children("a").attr("href");
            const image_thumbnail = $(e)
                .children("div.fr")
                .children("a")
                .children("img")
                .attr("src");
            const time = $(e).children("div.mr140").children(".grey").children("time").attr("title");
            if (title && link) {
                result.push({ title, link, image_thumbnail, time });
            }
        });
        return result;
    }
    catch (error) {
        console.error("Error scraping Tribunnews:", error.message);
        throw new Error(error.message || "Failed to scrape Tribunnews");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/berita/tribunnews",
        name: "tribunnews",
        category: "Berita",
        description: "This API endpoint allows you to retrieve the latest news headlines from Tribunnews.com, a major Indonesian online new...",
        tags: ["BERITA", "NEWS", "INDONESIA", "CURRENT EVENTS", "REGIONAL"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrapeTribunNews();
                return { status: true, data: data, timestamp: new Date().toISOString() };
            }
            catch (error) {
                return { status: false, error: error.message || "Internal Server Error", code: 500 };
            }
        },
    }
];
