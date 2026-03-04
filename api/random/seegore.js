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
async function fetchDetailedData(linkData) {
    try {
        const res = await axios_1.default.get(linkData.link, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(res.data);
        return {
            title: linkData.title,
            source: linkData.link,
            thumb: linkData.thumb,
            tag: $("div.site-main > div > header > div > div > p").text(),
            upload: $("div.site-main")
                .find("span.auth-posted-on > time:nth-child(2)")
                .text(),
            author: $("div.site-main").find("span.auth-name.mf-hide > a").text(),
            comment: linkData.comment,
            vote: linkData.vote,
            view: $("div.site-main")
                .find("span.post-meta-item.post-views.s-post-views.size-lg > span.count")
                .text(),
            video1: $("div.site-main").find("video > source").attr("src"),
            video2: $("div.site-main").find("video > a").attr("href"),
        };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Fetching detailed data failed");
    }
}
async function scrapSeegore() {
    try {
        const page = Math.floor(Math.random() * 228);
        const res = await axios_1.default.get(`https://seegore.com/gore/page/${page}`, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(res.data);
        const links = $("ul > li > article")
            .map((i, el) => ({
            title: $(el).find("div.content > header > h2").text(),
            link: $(el).find("div.post-thumbnail > a").attr("href") || "",
            thumb: $(el).find("div.post-thumbnail > a > div > img").attr("src"),
            view: $(el)
                .find("div.post-thumbnail > div.post-meta.bb-post-meta.post-meta-bg > span.post-meta-item.post-views")
                .text(),
            vote: $(el)
                .find("div.post-thumbnail > div.post-meta.bb-post-meta.post-meta-bg > span.post-meta-item.post-votes")
                .text(),
            tag: $(el).find("div.content > header > div > div.bb-cat-links").text(),
            comment: $(el)
                .find("div.content > header > div > div.post-meta.bb-post-meta > a")
                .text(),
        }))
            .get();
        if (links.length === 0) {
            throw new Error("No links found on the scraped page.");
        }
        const randomLink = links[Math.floor(Math.random() * links.length)];
        const detailedData = await fetchDetailedData(randomLink);
        return detailedData;
    }
    catch (error) {
        console.error("Scraping Error:", error.message);
        throw new Error("Scraping failed");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/r/seegore",
        name: "seegore",
        category: "Random",
        description: "This API endpoint provides random posts from Seegore, a website containing gore content.",
        tags: ["Random", "Gore", "Video", "Scraper", "Explicit"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const result = await scrapSeegore();
                return {
                    status: true,
                    data: result,
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
