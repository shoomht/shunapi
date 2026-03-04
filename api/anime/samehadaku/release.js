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
async function getBaseUrl() {
    try {
        const response = await axios_1.default.get(proxy() + "https://samehadaku.care/", {
            timeout: 30000,
        });
        const $ = cheerio.load(response.data);
        const scriptContent = $('script')
            .filter(function () {
            return $(this).html().includes("window.location.href");
        })
            .html();
        const urlMatch = scriptContent.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (urlMatch) {
            return urlMatch[1];
        }
        else {
            throw new Error("Base URL not found");
        }
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
async function getSamehadakuReleaseSchedule() {
    try {
        const baseUrl = await getBaseUrl();
        const data = {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
        };
        for await (const day of Object.keys(data)) {
            const res = await axios_1.default
                .get(proxy() +
                baseUrl +
                "/wp-json/custom/v1/all-schedule?" +
                new URLSearchParams({
                    perpage: "20",
                    day,
                    type: "schtml",
                }), {
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
            })
                .then((v) => v.data);
            data[day] = res;
        }
        return data;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/anime/samehadaku/release",
        name: "samehadaku release",
        category: "Anime",
        description: "This API endpoint provides the full release schedule for anime on Samehadaku, categorized by day of the week.",
        tags: ["Anime", "Samehadaku", "Release Schedule"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await getSamehadakuReleaseSchedule();
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
