var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function stickerlySearch(query) {
    try {
        const { data } = await axios_1.default.post(proxy() + "https://api.sticker.ly/v4/stickerPack/smartSearch", {
            keyword: query,
            enabledKeywordSearch: true,
            filter: {
                extendSearchResult: false,
                sortBy: "RECOMMENDED",
                languages: ["ALL"],
                minStickerCount: 5,
                searchBy: "ALL",
                stickerType: "ALL",
            },
        }, {
            headers: {
                "user-agent": "androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)",
                "content-type": "application/json",
                "accept-encoding": "gzip",
            },
            timeout: 30000,
        });
        if (!data.result || !data.result.stickerPacks) {
            return [];
        }
        return data.result.stickerPacks.map((pack) => ({
            name: pack.name,
            author: pack.authorName,
            stickerCount: pack.resourceFiles.length,
            viewCount: pack.viewCount,
            exportCount: pack.exportCount,
            isPaid: pack.isPaid,
            isAnimated: pack.isAnimated,
            thumbnailUrl: `${pack.resourceUrlPrefix}${pack.resourceFiles[pack.trayIndex]}`,
            url: pack.shareUrl,
        }));
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/sticker/stickerly-search",
        name: "stickerly search",
        category: "Sticker",
        description: "This API allows you to search for sticker packs on Sticker.ly using a query parameter.",
        tags: ["Sticker", "Search", "Stickerly"],
        example: "?query=love",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "Search keyword for sticker packs",
                example: "love",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query } = req.query || {};
            if (!query) {
                return {
                    status: false,
                    error: "Query parameter is required",
                    code: 400,
                };
            }
            if (typeof query !== "string" || query.trim().length === 0) {
                return {
                    status: false,
                    error: "Query must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await stickerlySearch(query.trim());
                if (result.length === 0) {
                    return {
                        status: false,
                        error: "No sticker packs found for the given query",
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
