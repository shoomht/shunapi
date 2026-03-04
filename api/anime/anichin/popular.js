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
async function scrape(url) {
    try {
        const { data } = await axios_1.default.get(proxy() + url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        const popularToday = [];
        $(".bixbox .listupd .bsx").each((_, element) => {
            const title = $(element).find(".tt").text().trim();
            const episode = $(element).find(".bt .epx").text().trim();
            const type = $(element).find(".typez").text().trim();
            const link = $(element).find("a").attr("href");
            const image = $(element).find("img").attr("src");
            popularToday.push({
                title: title,
                episode: episode,
                type: type,
                link: link,
                image: image,
            });
        });
        return popularToday;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Error scraping data: " + error.message);
    }
}
async function getRedirectUrl(domain) {
    try {
        const response = await axios_1.default.get(proxy() + domain, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(response.data);
        const redirectScriptContent = $("script").filter(function () {
            return $(this).html()?.includes("setTimeout");
        }).html();
        if (!redirectScriptContent) {
            throw new Error("Redirect script content not found");
        }
        const urlMatch = redirectScriptContent.match(/location\.href = '(https:\/\/[^']+)'/);
        if (urlMatch && urlMatch[1]) {
            return urlMatch[1];
        }
        else {
            throw new Error("Redirect URL not found in script");
        }
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Error fetching the page: " + error.message);
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/anime/anichin-popular",
        name: "anichin popular",
        category: "Anime",
        description: "This API endpoint retrieves a list of popular anime from Anichin.",
        tags: ["ANIME", "POPULAR", "SCRAPING"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const domain = "https://anichin.team/";
                const redirectUrl = await getRedirectUrl(domain);
                const data = await scrape(redirectUrl);
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
