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
async function scrapeLatestAnime() {
    try {
        const domain = "https://anichin.team/";
        const response = await axios_1.default.get(proxy() + domain, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $domain = cheerio.load(response.data);
        const redirectScriptContent = $domain("script").filter(function () {
            return $domain(this).html()?.includes("setTimeout");
        }).html();
        if (!redirectScriptContent) {
            throw new Error("Redirect script content not found");
        }
        const urlMatch = redirectScriptContent.match(/location\.href = '(https:\/\/[^']+)'/);
        if (!urlMatch || !urlMatch[1]) {
            throw new Error("Redirect URL not found in script");
        }
        const { data } = await axios_1.default.get(proxy() + urlMatch[1], {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        const results = [];
        $(".listupd.normal .bs").each((_, element) => {
            const linkElement = $(element).find("a");
            const title = linkElement.attr("title");
            const url = linkElement.attr("href");
            const episode = $(element).find(".bt .epx").text().trim();
            const thumbnail = $(element).find("img").attr("src");
            const type = $(element).find(".typez").text().trim();
            results.push({
                title: title,
                url: url,
                episode: episode,
                thumbnail: thumbnail,
                type: type,
            });
        });
        return results;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Error scraping latest anime: " + error.message);
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/anime/anichin-latest",
        name: "anichin latest",
        category: "Anime",
        description: "This API endpoint provides the latest anime updates from Anichin.",
        tags: ["ANIME", "LATEST", "SCRAPING"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrapeLatestAnime();
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
