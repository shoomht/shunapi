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
async function tiktokStalk(user) {
    try {
        const url = await axios_1.default.get(proxy() + `https://tiktok.com/@${user}`, {
            headers: {
                "User-Agent": "PostmanRuntime/7.32.2",
            },
            timeout: 30000,
        });
        const html = url.data;
        const $ = cheerio.load(html);
        const data = $("#__UNIVERSAL_DATA_FOR_REHYDRATION__").text();
        const result = JSON.parse(data);
        if (result["__DEFAULT_SCOPE__"]["webapp.user-detail"].statusCode !== 0) {
            throw new Error("User not found!");
        }
        return result["__DEFAULT_SCOPE__"]["webapp.user-detail"]["userInfo"];
    }
    catch (err) {
        throw new Error(`Error stalking TikTok user: ${err.message || err}`);
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/stalk/tiktok",
        name: "tiktok",
        category: "Stalker",
        description: "This API endpoint allows you to retrieve public profile information for a specified TikTok user using their username ...",
        tags: ["Stalker", "TikTok", "User", "Profile"],
        example: "?username=mrbeast",
        parameters: [
            {
                name: "username",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "The TikTok username to stalk",
                example: "mrbeast",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { username } = req.query || {};
            if (!username) {
                return {
                    status: false,
                    error: "Username parameter is required",
                    code: 400,
                };
            }
            if (typeof username !== "string" || username.trim().length === 0) {
                return {
                    status: false,
                    error: "Username must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await tiktokStalk(username.trim());
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
