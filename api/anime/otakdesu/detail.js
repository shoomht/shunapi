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
async function getAnimeDetail(url) {
    try {
        const { data } = await axios_1.default.get(proxy() + url, {
            timeout: 30000,
        });
        const $ = cheerio.load(data);
        const animeInfo = {
            title: $(".fotoanime .infozingle p span b:contains('Judul')")
                .parent()
                .text()
                .replace("Judul: ", "")
                .trim(),
            japaneseTitle: $(".fotoanime .infozingle p span b:contains('Japanese')")
                .parent()
                .text()
                .replace("Japanese: ", "")
                .trim(),
            score: $(".fotoanime .infozingle p span b:contains('Skor')")
                .parent()
                .text()
                .replace("Skor: ", "")
                .trim(),
            producer: $(".fotoanime .infozingle p span b:contains('Produser')")
                .parent()
                .text()
                .replace("Produser: ", "")
                .trim(),
            type: $(".fotoanime .infozingle p span b:contains('Tipe')")
                .parent()
                .text()
                .replace("Tipe: ", "")
                .trim(),
            status: $(".fotoanime .infozingle p span b:contains('Status')")
                .parent()
                .text()
                .replace("Status: ", "")
                .trim(),
            totalEpisodes: $(".fotoanime .infozingle p span b:contains('Total Episode')")
                .parent()
                .text()
                .replace("Total Episode: ", "")
                .trim(),
            duration: $(".fotoanime .infozingle p span b:contains('Durasi')")
                .parent()
                .text()
                .replace("Durasi: ", "")
                .trim(),
            releaseDate: $(".fotoanime .infozingle p span b:contains('Tanggal Rilis')")
                .parent()
                .text()
                .replace("Tanggal Rilis: ", "")
                .trim(),
            studio: $(".fotoanime .infozingle p span b:contains('Studio')")
                .parent()
                .text()
                .replace("Studio: ", "")
                .trim(),
            genres: $(".fotoanime .infozingle p span b:contains('Genre')")
                .parent()
                .text()
                .replace("Genre: ", "")
                .trim(),
            imageUrl: $(".fotoanime img").attr("src"),
        };
        const episodes = [];
        $(".episodelist ul li").each((index, element) => {
            const episodeTitle = $(element).find("span a").text();
            const episodeLink = $(element).find("span a").attr("href");
            const episodeDate = $(element).find(".zeebr").text();
            episodes.push({
                title: episodeTitle,
                link: episodeLink,
                date: episodeDate,
            });
        });
        return {
            animeInfo,
            episodes,
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
        endpoint: "/api/anime/otakudesu/detail",
        name: "otakudesu detail",
        category: "Anime",
        description: "This API endpoint provides comprehensive details and a full episode list for a specific anime from Otakudesu.",
        tags: ["Anime", "Otakudesu", "Detail"],
        example: "?url=https://otakudesu.cloud/anime/borto-sub-indo/",
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
                description: "Otakudesu anime detail URL",
                example: "https://otakudesu.cloud/anime/borto-sub-indo/",
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
                    error: "URL parameter is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "URL parameter must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const data = await getAnimeDetail(url.trim());
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
