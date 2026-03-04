var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const formatPostInfo = (postInfo) => ({
    ...postInfo,
    postID: `https://lahelu.com/post/${postInfo.postID}`,
    media: `${postInfo.media}`,
    mediaThumbnail: postInfo.mediaThumbnail == null
        ? null
        : `https://cache.lahelu.com/${postInfo.mediaThumbnail}`,
    userUsername: `https://lahelu.com/user/${postInfo.userUsername}`,
    userAvatar: `https://cache.lahelu.com/${postInfo.userAvatar}`,
    createTime: new Date(postInfo.createTime).toISOString(),
});
function getRandomNumber() {
    return Math.floor(Math.random() * 5);
}
async function laheluSearch() {
    try {
        const options = {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                Referer: "https://lahelu.com",
                "Accept-Language": "en-US,en;q=0.9",
                Accept: "application/json, text/plain, */*",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                DNT: "1",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-User": "?1",
                TE: "Trailers",
                Host: "lahelu.com",
                Origin: "https://lahelu.com",
                "X-Requested-With": "XMLHttpRequest",
            },
            timeout: 30000,
        };
        const response = await axios_1.default.get(`https://lahelu.com/api/post/get-recommendations?field=7&cursor=${getRandomNumber()}-0`, options);
        if (response.status === 200 && response.data && response.data.postInfos) {
            return response.data.postInfos.map(formatPostInfo);
        }
        else {
            throw new Error(`Request failed with status code ${response.status || "unknown"}`);
        }
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get random posts from Lahelu");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/r/lahelu",
        name: "lahelu",
        category: "Random",
        description: "This API endpoint retrieves random posts from the Lahelu platform.",
        tags: ["Random", "Social Media", "Content", "Lahelu"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const result = await laheluSearch();
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
