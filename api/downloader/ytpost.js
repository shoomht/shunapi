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
async function scrapeYoutubeCommunity(url) {
    try {
        const { data: response } = await axios_1.default.get(url);
        const $ = cheerio.load(response);
        const ytInitialData = JSON.parse($("script")
            .text()
            .match(/ytInitialData = ({.*?});/)?.[1] || "{}");
        const posts = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents
            .flatMap((section) => section.itemSectionRenderer?.contents || [])
            .map((item) => {
            const postRenderer = item.backstagePostThreadRenderer?.post?.backstagePostRenderer;
            if (!postRenderer)
                return null;
            const images = postRenderer.backstageAttachment?.postMultiImageRenderer
                ?.images || [];
            const imageUrls = images.map((imageObj) => {
                const thumbnails = imageObj.backstageImageRenderer.image.thumbnails;
                return thumbnails[thumbnails.length - 1].url;
            });
            return {
                postId: postRenderer.postId,
                author: postRenderer.authorText.simpleText,
                content: postRenderer.contentText?.runs
                    ?.map((run) => run.text)
                    .join("") || "",
                images: imageUrls,
            };
        })
            .filter(Boolean);
        return posts[0] || null;
    }
    catch (error) {
        console.error("Youtube Community scrape error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/d/ytpost",
        name: "Youtube Community",
        category: "Youtube Downloader",
        description: "This API endpoint scrapes the latest post from a YouTube channel's community tab.",
        tags: ["YOUTUBE", "DOWNLOADER", "COMMUNITY", "SCRAPER"],
        example: "?url=https://www.youtube.com/@YouTubeCreators/community",
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
                description: "The URL of the YouTube channel's community tab",
                example: "https://www.youtube.com/@YouTubeCreators/community",
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
                    error: "URL must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrapeYoutubeCommunity(url.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "Failed to fetch community post or no post found",
                        code: 404,
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
