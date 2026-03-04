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
async function downloadCapCutV2(videoUrl) {
    try {
        const mainPageResponse = await axios_1.default.get('https://anydownloader.com/en/online-capcut-video-downloader-without-watermark/');
        const $ = cheerio.load(mainPageResponse.data);
        const token = $('#token').val();
        const encodedUrl = Buffer.from(videoUrl).toString('base64');
        const hash = encodedUrl + '1037YWlvLWRs';
        const apiResponse = await axios_1.default.post('https://anydownloader.com/wp-json/aio-dl/video-data/', `url=${encodeURIComponent(videoUrl)}&token=${token}&hash=${Buffer.from(hash).toString('base64')}`, {
            headers: {
                'authority': 'anydownloader.com',
                'accept': '*/*',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://anydownloader.com',
                'referer': 'https://anydownloader.com/en/online-capcut-video-downloader-without-watermark/',
                'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
            }
        });
        const data = apiResponse.data;
        const { duration, source, sid, ...filteredData } = data;
        return filteredData;
    }
    catch (error) {
        throw error;
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/d/capcutv2",
        name: "capcutv2",
        category: "Downloader",
        description: "Alternative CapCut video downloader using third-party service.",
        tags: ["DOWNLOADER", "CapCut", "Video Download"],
        example: "?url=https://www.capcut.com/tv2/ZSSCR6UFU/",
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
                description: "CapCut video URL",
                example: "https://www.capcut.com/tv2/ZSSCR6UFU/",
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
                const result = await downloadCapCutV2(url.trim());
                return {
                    status: true,
                    data: result,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                if (error.response && error.response.status === 404) {
                    return {
                        status: false,
                        error: "Invalid URL or video not found.",
                        code: 404,
                    };
                }
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    }
];
