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
const base_url = "https://www.liputan6.com";
async function scrapeLiputan6News() {
    try {
        const response = await axios_1.default.get(base_url);
        const $ = cheerio.load(response.data);
        let result = [];
        const isi = $(".articles--iridescent-list article");
        isi.each((i, e) => {
            const title = $(".articles--iridescent-list--text-item__title-link-text", e)
                .text()
                .trim();
            const link = $("h4.articles--iridescent-list--text-item__title a", e).attr("href");
            const image_thumbnail = $("picture.articles--iridescent-list--text-item__figure-image img", e).attr("src");
            const time = $(".articles--iridescent-list--text-item__time", e).text().trim();
            if (title && link) {
                result.push({ title, link, image_thumbnail, time });
            }
        });
        return result;
    }
    catch (error) {
        console.error("Error scraping Liputan6 News:", error.message);
        throw new Error(error.message || "Failed to scrape Liputan6 News");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/berita/liputan6",
        name: "liputan6",
        category: "Berita",
        description: "This API endpoint fetches the latest news headlines from Liputan6.com, a prominent Indonesian online news portal.",
        tags: ["BERITA", "NEWS", "INDONESIA", "CURRENT EVENTS"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrapeLiputan6News();
                return { status: true, data: data, timestamp: new Date().toISOString() };
            }
            catch (error) {
                return { status: false, error: error.message || "Internal Server Error", code: 500 };
            }
        },
    }
];
