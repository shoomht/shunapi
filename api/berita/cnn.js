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
import __moment_1 from 'moment';
const moment_1 = { default: __moment_1 };
const base_url = "https://www.cnnindonesia.com";
async function scrapeCNNIndonesiaNews() {
    try {
        const response = await axios_1.default.get(base_url);
        const $ = cheerio.load(response.data);
        const isi = $("div.nhl-list article.flex-grow");
        const result = [];
        for (let i = 0; i < isi.length; i++) {
            const e = isi[i];
            const tagA = $("a.flex", e);
            if (tagA && tagA.attr("dtr-ttl")) {
                const title = tagA.attr("dtr-ttl")?.replace("\n", "").trim();
                const image_thumbnail = $("img", tagA).attr("src");
                const link = tagA.attr("href");
                if (!title || !image_thumbnail || !link) {
                    continue;
                }
                const url = new URL(image_thumbnail);
                const search_params = url.searchParams;
                search_params.set("w", "1024");
                search_params.set("q", "100");
                url.search = search_params.toString();
                const image_full = url.toString();
                const timeMatch = link.split("/")[4]?.split("-")[0];
                const newTime = timeMatch
                    ? (0, moment_1.default)(timeMatch, "YYYYMMDDhh:mm:ss").format("YYYY-MM-DD hh:mm")
                    : "";
                const slug = link ? link.replace(base_url, "") : "";
                let content = "";
                try {
                    const detailResponse = await axios_1.default.get(link);
                    const $detail = cheerio.load(detailResponse.data);
                    const contentElement = $detail("div.detail-wrap.flex.gap-4.relative");
                    $("script", contentElement).remove();
                    $("style", contentElement).remove();
                    $(".paradetail", contentElement).remove();
                    $(".detail_ads", contentElement).remove();
                    $(".linksisip", contentElement).remove();
                    $(".embed.videocnn", contentElement).remove();
                    content = contentElement
                        .text()
                        .replace(/\\n/g, "")
                        .replace(/Bagikan:/g, "")
                        .replace(/url telah tercopy/g, "")
                        .replace(/dis\/tsa/g, "")
                        .replace(/tim\/mik/g, "")
                        .replace(/Gambas:Video CNN/g, "")
                        .replace(/\s{2,}/g, " ")
                        .trim();
                }
                catch (err) {
                    console.error(`Failed to fetch content for link: ${link}`, err.message);
                }
                result.push({
                    title: title,
                    image_thumbnail: image_thumbnail,
                    image_full: image_full,
                    time: newTime,
                    link: link,
                    slug: slug,
                    content: content,
                });
            }
        }
        return result;
    }
    catch (error) {
        console.error("Error scraping CNN Indonesia News:", error);
        throw new Error(error.message || "Failed to scrape CNN Indonesia News");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/berita/cnn",
        name: "cnn Indonesia",
        category: "Berita",
        description: "This API endpoint allows you to retrieve the latest news headlines and detailed content from CNN Indonesia.",
        tags: ["BERITA", "NEWS", "INDONESIA", "CURRENT EVENTS"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrapeCNNIndonesiaNews();
                return { status: true, data: data, timestamp: new Date().toISOString() };
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
