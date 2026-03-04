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
import __crypto_js_1 from 'crypto-js';
const crypto_js_1 = { default: __crypto_js_1 };
import file_type_1 from 'file-type';
import buffer_1 from 'buffer';
class FaceSwap {
    debug;
    BASE;
    UPLOAD;
    MERGE;
    KEY;
    aesKey;
    iv;
    headers;
    constructor(debug = false) {
        this.debug = debug;
        this.BASE = "https://imgedit.ai/";
        this.UPLOAD = "https://upload.imgedit.ai/api/v1/files/uploadImgs";
        this.MERGE = "https://imgedit.ai/api/v1/al/mergeImageFace";
        this.KEY = this.randomChar(16);
        this.aesKey = null;
        this.iv = null;
        this.headers = {
            "authority": "imgedit.ai",
            "accept": "application/json, text/plain, */*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "authorization": "null",
            "content-type": "application/json",
            "origin": "https://imgedit.ai",
            "referer": "https://imgedit.ai/face-swap",
            "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        };
    }
    log(message) {
        if (this.debug) {
            console.log(`[FaceSwap] ${message}`);
        }
    }
    randomChar(length) {
        const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }).map(_ => char.charAt(Math.floor(Math.random() * char.length))).join("");
    }
    async fetchKeys() {
        this.log("Fetching keys...");
        const { data } = await axios_1.default.get(this.BASE, { headers: this.headers });
        const $ = cheerio.load(data);
        const scriptUrls = [];
        $('script[src]').each((i, el) => {
            const scriptSrc = $(el).attr('src');
            if (scriptSrc && scriptSrc.includes('/_nuxt/js/')) {
                scriptUrls.push(`https://imgedit.ai${scriptSrc}`);
            }
        });
        const latestScriptUrl = scriptUrls[scriptUrls.length - 1];
        const response = await axios_1.default.get(latestScriptUrl, { headers: this.headers });
        const scriptContent = response.data;
        const aesMatch = scriptContent.match(/var\s+aesKey\s*=\s*["'](\w{11,})['"]/i);
        const ivMatch = scriptContent.match(/var\s+iv\s*=\s*["'](\w{11,})['"]/i);
        this.aesKey = aesMatch ? aesMatch[1] : null;
        this.iv = ivMatch ? ivMatch[1] : null;
        this.log("Keys fetched");
    }
    decrypt(enc) {
        if (!this.aesKey || !this.iv) {
            throw new Error("AES key or IV not set. Call fetchKeys() first.");
        }
        const key = crypto_js_1.default.enc.Utf8.parse(this.aesKey);
        const iv = crypto_js_1.default.enc.Utf8.parse(this.iv);
        const decipher = crypto_js_1.default.AES.decrypt(enc, key, { iv, mode: crypto_js_1.default.mode.CBC, padding: crypto_js_1.default.pad.Pkcs7 });
        return JSON.parse(decipher.toString(crypto_js_1.default.enc.Utf8));
    }
    async upload(buffer, fileName = 'image.png') {
        this.log("Uploading image...");
        const fileType = await (0, file_type_1.fileTypeFromBuffer)(buffer);
        if (!fileType || !fileType.mime.startsWith('image/')) {
            throw new Error("File type is not a supported image.");
        }
        const res = await axios_1.default.post(this.UPLOAD, {
            files_base64: `data:${fileType.mime};base64,${buffer.toString("base64")}`,
        }, {
            headers: this.headers,
            params: { ekey: this.KEY, soft_id: "imgedit_web" },
        });
        this.log("Image uploaded");
        return this.decrypt(res.data.data);
    }
    async mergeFaces(markPath, extraPath) {
        this.log("Merging faces...");
        const res = await axios_1.default.post(this.MERGE, {
            image_key_type: 3,
            mark_image_url: markPath,
            extra_image_url: extraPath,
        }, {
            headers: this.headers,
            params: { ekey: this.KEY, soft_id: "imgedit_web" },
        });
        this.log("Face swap completed");
        return this.decrypt(res.data.data);
    }
}
async function scrapeFaceSwapFromUrls(image1Url, image2Url) {
    const swapper = new FaceSwap();
    await swapper.fetchKeys();
    const markResponse = await axios_1.default.get(proxy() + image1Url, { responseType: "arraybuffer", timeout: 15000 });
    const markBuffer = buffer_1.Buffer.from(markResponse.data);
    const markUpload = await swapper.upload(markBuffer);
    const extraResponse = await axios_1.default.get(proxy() + image2Url, { responseType: "arraybuffer", timeout: 15000 });
    const extraBuffer = buffer_1.Buffer.from(extraResponse.data);
    const extraUpload = await swapper.upload(extraBuffer);
    const result = await swapper.mergeFaces(markUpload.data.paths[0], extraUpload.data.paths[0]);
    return result;
}
async function scrapeFaceSwapFromFiles(image1Buffer, image1FileName, image2Buffer, image2FileName) {
    const swapper = new FaceSwap();
    await swapper.fetchKeys();
    const markUpload = await swapper.upload(image1Buffer, image1FileName);
    const extraUpload = await swapper.upload(image2Buffer, image2FileName);
    const result = await swapper.mergeFaces(markUpload.data.paths[0], extraUpload.data.paths[0]);
    return result;
}
export default [
    {
        metode: "GET",
        endpoint: "/api/imgedit/faceswap",
        name: "face swap",
        category: "ImgEdit",
        description: "Swap faces between two images provided as URLs.",
        tags: ["IMGEDIT", "Face Swap", "AI", "Image Editing"],
        example: "?image1=https://files.catbox.moe/5cr45d.png&image2=https://files.catbox.moe/1ait9s.jpg",
        parameters: [
            {
                name: "image1",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                    minLength: 1,
                    maxLength: 2000,
                },
                description: "URL of the first image (main image to swap face into).",
                example: "https://files.catbox.moe/5cr45d.png",
            },
            {
                name: "image2",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                    minLength: 1,
                    maxLength: 2000,
                },
                description: "URL of the second image (image containing the face to be swapped).",
                example: "https://files.catbox.moe/1ait9s.jpg",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { image1, image2 } = req.query || {};
            if (!image1) {
                return {
                    status: false,
                    error: "Parameter 'image1' is required.",
                    code: 400,
                };
            }
            if (typeof image1 !== "string" || image1.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'image1' must be a non-empty string.",
                    code: 400,
                };
            }
            if (!image2) {
                return {
                    status: false,
                    error: "Parameter 'image2' is required.",
                    code: 400,
                };
            }
            if (typeof image2 !== "string" || image2.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'image2' must be a non-empty string.",
                    code: 400,
                };
            }
            try {
                new URL(image1.trim());
                new URL(image2.trim());
                const result = await scrapeFaceSwapFromUrls(image1.trim(), image2.trim());
                if (!result.data || !result.data.ImageUrl) {
                    throw new Error("No result image URL returned.");
                }
                return {
                    status: true,
                    data: result.data.ImageUrl,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                console.error("Error:", error);
                return {
                    status: false,
                    error: error.message || "An error occurred while processing the face swap.",
                    code: 500,
                };
            }
        },
    }
];
