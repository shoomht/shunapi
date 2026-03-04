var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function laheluDownloader(url) {
    const postID = url.replace("https://lahelu.com/post/", "");
    const headers = {
        "Host": "lahelu.com",
        "accept": "application/json, text/plain, */*",
        "user-agent": "Mozilla/5.0 (Linux; Android 11; SM-A207F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    };
    try {
        const response = await axios_1.default.get("https://lahelu.com/api/post/get", {
            headers,
            params: { postID },
        });
        if (response.status === 200) {
            const data = response.data;
            const postInfo = data.postInfo || {};
            const { postID: extractedPostID, userID, title, media, sensitive = false, hashtags = [], createTime = 0, } = postInfo;
            return {
                status: true,
                user_id: userID,
                post_id: extractedPostID,
                result: postInfo,
                title,
                media,
                sensitive,
                hashtags,
                create_time: new Date(createTime * 1000).toISOString(),
            };
        }
        return null;
    }
    catch (error) {
        console.error("Error fetching Lahelu post data:", error.message);
        throw new Error("Failed to get response from Lahelu API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/d/lahelu",
        name: "lahelu",
        category: "Downloader",
        description: "This API endpoint allows you to retrieve information about a specific post from Lahelu.com by providing the post's URL.",
        tags: ["Downloader", "Social Media", "Lahelu"],
        example: "?url=https://lahelu.com/post/PMujNAfxy",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 200,
                },
                description: "The Lahelu post URL",
                example: "https://lahelu.com/post/PMujNAfxy",
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
            if (!url.includes("https://lahelu.com/post/")) {
                return {
                    status: false,
                    error: "Invalid URL format. Make sure it is a valid Lahelu post URL (e.g., https://lahelu.com/post/...).",
                    code: 400,
                };
            }
            try {
                const result = await laheluDownloader(url.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "Post not found or URL is invalid.",
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
