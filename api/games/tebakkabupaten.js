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
const baseUrl = "https://id.m.wikipedia.org";
async function fetchImageUrl(url) {
    try {
        const response = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const src = $("tr.mergedtoprow td.infobox-full-data.maptable div.ib-settlement-cols-row div.ib-settlement-cols-cell a.mw-file-description img.mw-file-element").attr("src");
        return src ? "https:" + src : null;
    }
    catch (error) {
        console.error("Error fetching image URL:", error.message);
        return null;
    }
}
async function scrape() {
    try {
        const response = await axios_1.default.get(baseUrl + "/wiki/Daftar_kabupaten_di_Indonesia", {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const kabupatenList = $("td a[href^='/wiki/Kabupaten']")
            .map((_, element) => {
            const link = $(element).attr("href");
            const name = $(element).attr("title");
            return link && name ? { link: baseUrl + link, name: name } : null;
        })
            .get()
            .filter((item) => item !== null);
        if (kabupatenList.length === 0) {
            throw new Error("No kabupaten found");
        }
        const randomKabupaten = kabupatenList[Math.floor(Math.random() * kabupatenList.length)];
        const imageUrl = await fetchImageUrl(randomKabupaten.link);
        const judulBaru = randomKabupaten.name.replace("Kabupaten ", "");
        const ukuranBaru = imageUrl ? imageUrl.replace(/\/\d+px-/, "/1080px-") : null;
        return {
            link: randomKabupaten.link,
            title: judulBaru,
            url: ukuranBaru,
        };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to fetch kabupaten data");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/games/kabupaten",
        name: "tebak kabupaten",
        category: "Games",
        description: "This API endpoint provides a random Indonesian regency (kabupaten) for a guessing game, including its map image.",
        tags: ["Games", "Geography", "Indonesia", "Kabupaten", "Map", "Education"],
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
