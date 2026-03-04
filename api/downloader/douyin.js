var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const douyinDownloader = {
    download: async (url) => {
        const api = "https://lovetik.app/api/ajaxSearch";
        const payload = {
            q: url,
            lang: "en",
        };
        try {
            const { data } = await axios_1.default.post(api, payload, {
                headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    origin: "https://lovetik.app",
                    priority: "u=1, i",
                    referer: "https://lovetik.app/en",
                    "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
                    "x-requested-with": "XMLHttpRequest",
                },
                transformRequest: [
                    (data) => Object.keys(data)
                        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
                        .join("&"),
                ],
            });
            const extractData = data.data;
            const downloadUrls = extractData.match(/https:\/\/(dl\.snapcdn\.app|v\d+-cold\.douyinvod\.com)\/get\?token=[^"]+/g) || [];
            const thumbnailMatch = /<img src="([^"]+)"/.exec(extractData);
            const thumbnail = thumbnailMatch ? thumbnailMatch[1] : null;
            const titleMatch = /<h3>(.*?)<\/h3>/.exec(extractData);
            const title = titleMatch ? titleMatch[1] : null;
            return {
                status: true,
                data: {
                    title: title || "Untitled Video",
                    thumbnail: thumbnail || null,
                    downloads: downloadUrls.map((url, index) => ({
                        quality: `Version ${index + 1}`,
                        url,
                    })),
                },
            };
        }
        catch (error) {
            console.error("API Error:", error.message);
            return {
                status: false,
                error: "Failed to fetch video information. Please check the URL and try again.",
            };
        }
    },
    isValidUrl: (url) => {
        return /^https?:\/\/(www\.)?(douyin\.com|tiktok\.com)\/[^\s]+/.test(url);
    },
};
export default [
    {
        metode: "GET",
        endpoint: "/api/d/douyin",
        name: "douyin",
        category: "Downloader",
        description: "This API endpoint allows you to download Douyin/TikTok videos by providing the video URL as a query parameter.",
        tags: ["DOWNLOADER", "VIDEO", "TIKTOK"],
        example: "?url=https://www.douyin.com/video/7256984651137289483",
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
                description: "Douyin/TikTok video URL",
                example: "https://www.douyin.com/video/7256984651137289483",
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
            if (!douyinDownloader.isValidUrl(url.trim())) {
                return {
                    status: false,
                    error: "Invalid Douyin/TikTok URL format",
                    code: 400,
                };
            }
            try {
                const result = await douyinDownloader.download(url.trim());
                if (!result.status) {
                    return {
                        status: false,
                        error: result.error || "Failed to download video",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: result.data,
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
