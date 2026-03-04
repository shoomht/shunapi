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
        const title = $(".entry-title").text().trim();
        const thumbnail = $(".thumb img").attr("src");
        const rating = $(".rating strong").text().replace("Rating ", "").trim();
        const followers = $(".bmc").text().replace("Followed ", "").replace(" people", "").trim();
        const synopsis = $(".synp .entry-content").text().trim();
        const alternativeTitles = $(".alter").text().trim();
        const status = $(".info-content .spe span:contains(\"Status\")").text().replace("Status:", "").trim();
        const network = $(".info-content .spe span:contains(\"Network\") a").text().trim();
        const studio = $(".info-content .spe span:contains(\"Studio\") a").text().trim();
        const released = $(".info-content .spe span:contains(\"Released\")").text().replace("Released:", "").trim();
        const duration = $(".info-content .spe span:contains(\"Duration\")").text().replace("Duration:", "").trim();
        const season = $(".info-content .spe span:contains(\"Season\") a").text().trim();
        const country = $(".info-content .spe span:contains(\"Country\") a").text().trim();
        const type = $(".info-content .spe span:contains(\"Type\")").text().replace("Type:", "").trim();
        const episodes = $(".info-content .spe span:contains(\"Episodes\")").text().replace("Episodes:", "").trim();
        const genres = $(".genxed a").map((_, el) => $(el).text().trim()).get();
        return {
            title,
            thumbnail,
            rating,
            followers,
            synopsis,
            alternativeTitles,
            status,
            network,
            studio,
            released,
            duration,
            season,
            country,
            type,
            episodes,
            genres,
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
        endpoint: "/api/anime/anichin-detail",
        name: "anichin detail",
        category: "Anime",
        description: "This API endpoint allows you to retrieve detailed information about an anime from Anichin by providing its URL.",
        tags: ["ANIME", "SCRAPING", "DETAIL"],
        example: "?url=https://anichin.forum/renegade-immortal-episode-69-subtitle-indonesia/",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
                description: "Anime URL",
                example: "https://anichin.forum/renegade-immortal-episode-69-subtitle-indonesia/",
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
                    error: "URL is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "URL must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const data = await scrapeDetail(url.trim());
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
