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
const fetchMangatoon = async (q) => {
    try {
        const url = `https://mangatoon.mobi/id/search?word=${encodeURIComponent(q)}`;
        const response = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const result = {
            internet: [],
            komik: [],
            novel: [],
        };
        $(".comics-result").each((index, element) => {
            const typeTitle = $(element).find(".type-title").text().trim();
            const resultCount = $(element).find(".result-count").text().trim();
            const items = [];
            $(element)
                .find(".recommend-item")
                .each((idx, el) => {
                const title = $(el).find(".recommend-comics-title span").text().trim();
                const image = $(el).find(".comics-image img").attr("data-src");
                const link = `https://mangatoon.mobi${$(el).find("a").attr("href")}`;
                items.push({ title, image, link });
            });
            if (typeTitle.includes("Telusuri komik di internet")) {
                result.internet.push({ resultCount, items });
            }
            else if (typeTitle.includes("Komik")) {
                result.komik.push({ resultCount, items });
            }
        });
        $(".novel-result").each((index, element) => {
            const typeTitle = $(element).find(".type-title").text().trim();
            const resultCount = $(element).find(".result-count").text().trim();
            const items = [];
            $(element)
                .find(".recommend-item")
                .each((idx, el) => {
                const title = $(el).find(".recommend-comics-title span").text().trim();
                const image = $(el).find(".comics-image img").attr("data-src");
                const link = `${$(el).find("a").attr("href")}`;
                items.push({ title, image, link });
            });
            if (typeTitle.includes("Novel")) {
                result.novel.push({ resultCount, items });
            }
        });
        return result;
    }
    catch (error) {
        console.error("Error:", error.message);
        throw new Error("Failed to fetch data from Mangatoon");
    }
};
export default [
    {
        metode: "GET",
        endpoint: "/api/s/mangatoon",
        name: "mangatoon",
        category: "Search",
        description: "This API endpoint allows users to search for comics and novels on Mangatoon.",
        tags: ["Search", "Comics", "Novels", "Manga"],
        example: "?query=cat",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "The search query for Mangatoon",
                example: "cat",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query } = req.query || {};
            if (!query) {
                return {
                    status: false,
                    error: "Query parameter is required",
                    code: 400,
                };
            }
            if (typeof query !== "string" || query.trim().length === 0) {
                return {
                    status: false,
                    error: "Query must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await fetchMangatoon(query.trim());
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
