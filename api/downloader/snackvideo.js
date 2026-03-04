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
async function scrapeSnackVideo(url) {
    try {
        const { data: html } = await axios_1.default.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
            timeout: 30000,
        });
        const $ = cheerio.load(html);
        const videoDataScript = $("#VideoObject").html();
        if (!videoDataScript) {
            throw new Error("Video data not found in the page.");
        }
        const videoData = JSON.parse(videoDataScript);
        const result = {
            url: videoData.url || "",
            title: videoData.name || "",
            description: videoData.description || "",
            thumbnail: videoData.thumbnailUrl ? videoData.thumbnailUrl[0] : "",
            uploadDate: videoData.uploadDate ? new Date(videoData.uploadDate).toISOString().split("T")[0] : "",
            videoUrl: videoData.contentUrl || "",
            duration: formatDuration(videoData.duration),
            interaction: {
                views: videoData.interactionStatistic?.find((stat) => stat.interactionType["@type"] === "https://schema.org/WatchAction")?.userInteractionCount || 0,
                likes: videoData.interactionStatistic?.find((stat) => stat.interactionType["@type"] === "https://schema.org/LikeAction")?.userInteractionCount || 0,
                shares: videoData.interactionStatistic?.find((stat) => stat.interactionType["@type"] === "https://schema.org/ShareAction")?.userInteractionCount || 0,
            },
            creator: {
                name: videoData.creator?.mainEntity?.name || "",
                profileUrl: videoData.creator?.mainEntity?.url || "",
                bio: videoData.creator?.mainEntity?.description || "",
            },
        };
        return result;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
function formatDuration(duration) {
    const match = duration.match(/^PT(\d+)M(\d+)S$/);
    if (match) {
        return `${match[1]} minutes ${match[2]} seconds`;
    }
    return duration;
}
export default [
    {
        metode: "GET",
        endpoint: "/api/d/snackvideo",
        name: "snack video",
        category: "Downloader",
        description: "This API endpoint allows you to retrieve detailed information and the direct download link for a video hosted on Snac...",
        tags: ["DOWNLOADER", "Snack Video", "Video Scraper", "Social Media"],
        example: "?url=https://s.snackvideo.com/p/dwlMd51U",
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
                description: "Snack Video URL",
                example: "https://s.snackvideo.com/p/dwlMd51U",
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
            if (!/^https?:\/\/(www\.)?s\.snackvideo\.com\//.test(url.trim())) {
                return {
                    status: false,
                    error: "Invalid Snack Video URL format",
                    code: 400,
                };
            }
            try {
                const videoData = await scrapeSnackVideo(url.trim());
                if (!videoData) {
                    return {
                        status: false,
                        error: "Video data not found",
                        code: 404,
                    };
                }
                return {
                    status: true,
                    data: videoData,
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
