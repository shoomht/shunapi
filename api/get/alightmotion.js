var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function amdata(url) {
    try {
        const match = url.match(/\/u\/([^\/]+)\/p\/([^\/\?#]+)/);
        if (!match)
            throw new Error("Invalid URL format. Expected: https://alight.link/u/UID/p/PID");
        const { data } = await axios_1.default.post("https://us-central1-alight-creative.cloudfunctions.net/getProjectMetadata", {
            data: {
                uid: match[1],
                pid: match[2],
                platform: "android",
                appBuild: 1002592,
                acctTestMode: "normal",
            },
        }, {
            timeout: 30000,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        return data.result?.info;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API for Alight Motion data");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/get/ampreset",
        name: "Detail Alight Motion Preset",
        category: "Get Data",
        description: "This API endpoint allows you to retrieve detailed metadata for an Alight Motion project.",
        tags: ["Alight Motion", "Metadata", "Preset", "Project", "Get Data"],
        example: "?url=https://alight.link/u/123456/p/abcdef",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 200,
                    pattern: "^https:\\/\\/alight\\.link\\/u\\/[^\\/]+\\/p\\/[^\\/\\?#]+$",
                },
                description: "Alight Motion project URL (e.g., https://alight.link/u/UID/p/PID)",
                example: "https://alight.link/u/123456/p/abcdef",
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
            if (!/^https:\/\/alight\.link\/u\/[^\/]+\/p\/[^\/\?#]+$/.test(url.trim())) {
                return {
                    status: false,
                    error: "Invalid URL format. Expected: https://alight.link/u/UID/p/PID",
                    code: 400,
                };
            }
            try {
                const result = await amdata(url.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "No result returned from Alight Motion API",
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
