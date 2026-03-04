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
import url_1 from 'url';
async function scrapeTwitter(videoUrl) {
    const apiUrl = "https://snaptwitter.com/action.php";
    try {
        const { data: html } = await axios_1.default.get("https://snaptwitter.com/");
        const $tok = cheerio.load(html);
        const tokenValue = $tok('input[name="token"]').attr("value");
        const formData = new url_1.URLSearchParams();
        formData.append("url", videoUrl);
        formData.append("token", tokenValue || "");
        const config = {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        };
        const response = await axios_1.default.post(apiUrl, formData, config);
        const $ = cheerio.load(response.data.data);
        const result = {
            imgUrl: $(".videotikmate-left img").attr("src"),
            downloadLink: `${$(".abuttons a").attr("href")}`,
            videoTitle: $(".videotikmate-middle h1").text().trim(),
            videoDescription: $(".videotikmate-middle p span").text().trim(),
        };
        return result;
    }
    catch (error) {
        console.error("Error downloading video:", error);
        throw new Error("Failed to download video data");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/d/twitter",
        name: "twitter",
        category: "Downloader",
        description: "This API endpoint allows users to download videos from Twitter by providing the video's URL.",
        tags: ["Downloader", "Twitter", "Video", "Social Media", "Media"],
        example: "?url=https://twitter.com/9GAG/status/1661175429859012608",
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
                description: "Twitter video URL",
                example: "https://twitter.com/9GAG/status/1661175429859012608",
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
                const result = await scrapeTwitter(url.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "Failed to download video data",
                        code: 500,
                    };
                }
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
