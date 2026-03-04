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
async function fb(url) {
    try {
        const validUrl = /(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/;
        if (!validUrl.test(url)) {
            throw new Error("Invalid URL provided");
        }
        // Encode URL untuk form data
        const encodedUrl = encodeURIComponent(url);
        const formData = `url=${encodedUrl}&lang=en&type=redirect`;
        const response = await axios_1.default.post(proxy() + "https://getvidfb.com/", formData, {
            headers: {
                'authority': 'getvidfb.com',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'cache-control': 'max-age=0',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://getvidfb.com',
                'referer': 'https://getvidfb.com/',
                'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
            },
            timeout: 30000,
        });
        const $ = cheerio.load(response.data);
        // Cari div dengan id snaptik-video
        const videoContainer = $('#snaptik-video');
        if (!videoContainer.length) {
            throw new Error("Video container not found");
        }
        // Ambil thumbnail dari img di dalam snaptik-left
        const thumb = videoContainer.find('.snaptik-left img').attr('src');
        // Ambil title dari h3
        const title = videoContainer.find('.snaptik-middle h3').text().trim();
        const hasil = [];
        // Ambil semua link download dari abuttons
        videoContainer.find('.abuttons a').each((_, el) => {
            const link = $(el).attr('href');
            const spanText = $(el).find('.span-icon span').last().text().trim();
            if (link && spanText && link.startsWith('http')) {
                let resolution = 'Unknown';
                let format = 'Unknown';
                // Parse resolution dan format dari text
                if (spanText.includes('HD')) {
                    resolution = 'HD';
                    format = 'mp4';
                }
                else if (spanText.includes('SD')) {
                    resolution = 'SD';
                    format = 'mp4';
                }
                else if (spanText.includes('Mp3') || spanText.includes('Audio')) {
                    resolution = 'Audio';
                    format = 'mp3';
                }
                else if (spanText.includes('Photo') || spanText.includes('Jpg')) {
                    resolution = 'Photo';
                    format = 'jpg';
                }
                hasil.push({
                    url: link,
                    resolution,
                    format,
                });
            }
        });
        if (hasil.length === 0) {
            throw new Error("No download links found for the provided URL.");
        }
        return {
            thumbnail: thumb,
            title: title || "Facebook Video",
            data: hasil,
        };
    }
    catch (err) {
        throw new Error(err.message || "Failed to retrieve data from Facebook video");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/d/facebook",
        name: "facebook",
        category: "Downloader",
        description: "This API endpoint downloads videos from Facebook.",
        tags: ["Downloader", "Facebook", "Video", "Social Media", "API"],
        example: "?url=https://www.facebook.com/share/r/12BFZAtjpS8/?mibextid=qDwCgo",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 2048,
                },
                description: "Facebook video URL",
                example: "https://www.facebook.com/share/r/12BFZAtjpS8/?mibextid=qDwCgo",
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
                    error: "Parameter 'url' is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'url' must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await fb(url.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "No result returned from API",
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
