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
async function getSamehadakuDetail(link) {
    try {
        const response = await axios_1.default.get(proxy() + link, {
            headers: {
                "authority": "samehadaku.care",
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
        if (response.statusText !== "OK")
            throw new Error("Failed to fetch data");
        const $ = cheerio.load(response.data);
        return {
            title: $("h1[itemprop='name']").text().trim(),
            thumbnail: $(".infoanime .thumb > img").attr("src") || "",
            published: $(".infoanime time[itemprop='datePublished']").attr("datetime") || "",
            rating: `${$(".infoanime span[itemprop='ratingValue']").text().trim()}/10`,
            description: $(".infox .desc").text().trim(),
            genres: $(".infox .genre-info > a")
                .map((_, el) => $(el).text().trim())
                .get(),
            episodes: $(".lstepsiode > ul > li")
                .map((_, el) => ({
                title: $(el).find(".lchx > a").text().trim(),
                date: $(el).find(".date").text().trim(),
                link: $(el).find(".eps > a").attr("href"),
            }))
                .get(),
        };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/anime/samehadaku/detail",
        name: "samehadaku detail",
        category: "Anime",
        description: "This API endpoint provides detailed information and a list of episodes for a specific anime from Samehadaku.",
        tags: ["Anime", "Samehadaku", "Detail"],
        example: "?link=https://samehadaku.email/anime/blue-lock-season-2/",
        parameters: [
            {
                name: "link",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
                description: "Anime detail URL",
                example: "https://samehadaku.email/anime/blue-lock-season-2/",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { link } = req.query || {};
            if (!link) {
                return {
                    status: false,
                    error: "Link parameter is required",
                    code: 400,
                };
            }
            if (typeof link !== "string" || link.trim().length === 0) {
                return {
                    status: false,
                    error: "Link parameter must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const details = await getSamehadakuDetail(link.trim());
                return {
                    status: true,
                    data: details,
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
