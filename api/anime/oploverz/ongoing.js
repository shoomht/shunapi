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
const baseUrl = "https://oploverz.org";
const ongoingUrl = `${baseUrl}/ongoing/`;
async function scrapeOploverzOngoing() {
    try {
        const { data } = await axios_1.default.get(proxy() + ongoingUrl, {
            headers: {
                "authority": "oploverz.org",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "max-age=0",
                "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": '"Android"',
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
            },
            timeout: 30000,
        });
        const $ = cheerio.load(data);
        return $(".bg-white.shadow.xrelated.relative")
            .map((_, el) => ({
            title: $(el).find(".titlelist.tublok").text().trim(),
            url: $(el).find("a").attr("href"),
            imgSrc: $(el).find("img").attr("src"),
            episodes: $(el).find(".eplist").text().trim(),
            rating: $(el).find(".starlist").text().trim() || "N/A",
        }))
            .get();
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/anime/oploverz-ongoing",
        name: "oploverz ongoing",
        category: "Anime",
        description: "This API endpoint provides a list of ongoing anime series from Oploverz.",
        tags: ["Anime", "Ongoing", "Series"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const results = await scrapeOploverzOngoing();
                if (!results) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: results,
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
