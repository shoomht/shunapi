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
async function scrape() {
    const page = Math.floor(20 * Math.random()) + 1;
    const url = `https://rimbakita.com/daftar-nama-hewan-lengkap/${page}/`;
    try {
        const response = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const json = $("div.entry-content.entry-content-single img[class*=wp-image-][data-src]")
            .map((_, el) => {
            const src = $(el).attr("data-src");
            if (!src) {
                return null;
            }
            const titleMatch = src.split("/").pop();
            const title = titleMatch
                ? titleMatch.replace(/-/g, " ").replace(/\..+$/, "")
                : "Unknown Animal";
            return {
                title: title.charAt(0).toUpperCase() + title.slice(1),
                url: src,
            };
        })
            .get()
            .filter((item) => item !== null);
        if (json.length === 0) {
            throw new Error("No animals found");
        }
        return json;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to fetch animal data");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/games/tebakhewan",
        name: "tebak hewan",
        category: "Games",
        description: "This API endpoint provides a random list of animals with their images, suitable for a guessing game ('Tebak Hewan').",
        tags: ["Games", "Animals", "Guessing Game", "Education", "Images"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrape();
                if (!data) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
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
