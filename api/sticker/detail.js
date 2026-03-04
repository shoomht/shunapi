var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function stickerlyDetail(url) {
    const match = url.match(/\/s\/([^\/\?#]+)/);
    if (!match)
        throw new Error("Invalid URL");
    try {
        const { data } = await axios_1.default.get(proxy() + `https://api.sticker.ly/v4/stickerPack/${match[1]}?needRelation=true`, {
            headers: {
                "user-agent": "androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)",
                "content-type": "application/json",
                "accept-encoding": "gzip",
            },
            timeout: 30000,
        });
        return {
            name: data.result.name,
            author: {
                name: data.result.user.displayName,
                username: data.result.user.userName,
                bio: data.result.user.bio,
                followers: data.result.user.followerCount,
                following: data.result.user.followingCount,
                isPrivate: data.result.user.isPrivate,
                avatar: data.result.user.profileUrl,
                website: data.result.user.website,
                url: data.result.user.shareUrl,
            },
            stickers: data.result.stickers.map((stick) => ({
                fileName: stick.fileName,
                isAnimated: stick.isAnimated,
                imageUrl: `${data.result.resourceUrlPrefix}${stick.fileName}`,
            })),
            stickerCount: data.result.stickers.length,
            viewCount: data.result.viewCount,
            exportCount: data.result.exportCount,
            isPaid: data.result.isPaid,
            isAnimated: data.result.isAnimated,
            thumbnailUrl: `${data.result.resourceUrlPrefix}${data.result.stickers[data.result.trayIndex].fileName}`,
            url: data.result.shareUrl,
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
        endpoint: "/api/sticker/stickerly-detail",
        name: "stickerly detail",
        category: "Sticker",
        description: "This API endpoint retrieves detailed information about a sticker pack from Sticker.ly using its share URL.",
        tags: ["Sticker", "Stickerly", "Detail"],
        example: "?url=https://sticker.ly/s/W7ES6T",
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
                description: "Sticker.ly share URL",
                example: "https://sticker.ly/s/W7ES6T",
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
            if (!url.startsWith("https://sticker.ly/s/")) {
                return {
                    status: false,
                    error: "Invalid Sticker.ly URL format",
                    code: 400,
                };
            }
            try {
                const result = await stickerlyDetail(url.trim());
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
