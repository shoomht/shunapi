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
import __form_data_1 from 'form-data';
const form_data_1 = { default: __form_data_1 };
import file_type_1 from 'file-type';
import __path_1 from 'path';
const path_1 = { default: __path_1 };
import buffer_1 from 'buffer';
const createImageResponse = (buffer, filename = null) => {
    const headers = {
        "Content-Type": "image/png",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
    };
    if (filename) {
        headers["Content-Disposition"] = `inline; filename="${filename}"`;
    }
    return new Response(buffer, { headers });
};
class PhotoToCartoonAPI {
    BASE;
    UPLOAD;
    GENERATE;
    TASK;
    KEY;
    aesKey;
    iv;
    headers;
    styleMaps;
    constructor() {
        this.BASE = "https://imgedit.ai/";
        this.UPLOAD = "https://uploads.imgedit.ai/api/v1/draw-cf/upload";
        this.GENERATE = "https://imgedit.ai/api/v1/draw-cf/generate";
        this.TASK = "https://imgedit.ai/api/v1/draw-cf/";
        this.KEY = this.randomChar(16);
        this.aesKey = null;
        this.iv = null;
        this.headers = {
            "authority": "uploads.imgedit.ai",
            "accept": "application/json, text/plain, */*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "authorization": "null",
            "origin": "https://imgedit.ai",
            "referer": "https://imgedit.ai/",
            "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        };
        this.styleMaps = {
            'sketch_v2': {
                'ink_painting': 16,
                'bg_line': 15,
                'color_rough': 14,
                'gouache': 13,
                'manga_sketch': 12,
                'ink_sketch': 11,
                'pencil_sketch': 10,
                'sketch': 8,
                'anime_sketch': 6,
                'line_art': 3,
                'simplex': 4,
                'doodle': 5,
                'intricate_line': 2,
            },
            'anime': {
                'color_rough': 42,
                'ink_painting': 41,
                '3d': 40,
                'clay': 39,
                'mini': 38,
                'illustration': 37,
                'wojak': 36,
                'felted_doll': 35,
                'comic_book': 33,
                'vector': 32,
                'gothic': 29,
                '90s_shoujomanga': 26,
                'grumpy_3d': 25,
                'tinies': 24,
                'witty': 23,
                'simple_drawing': 22,
                'ink_stains': 21,
                'crayon': 20,
            },
        };
    }
    randomChar(length) {
        const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }).map(_ => char.charAt(Math.floor(Math.random() * char.length))).join("");
    }
    delay(msec) {
        return new Promise(resolve => setTimeout(resolve, msec));
    }
    async fetchKeys() {
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
        this.aesKey = aesMatch[1];
        this.iv = ivMatch[1];
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
    async upload(buffer, fileName) {
        const fileType = await (0, file_type_1.fileTypeFromBuffer)(buffer);
        if (!fileType || !fileType.mime.startsWith('image/')) {
            throw new Error("File type is not a supported image.");
        }
        const form = new form_data_1.default();
        form.append('image', buffer, {
            filename: fileName || `image.${fileType.ext}`,
            contentType: fileType.mime,
        });
        const res = await axios_1.default.post(this.UPLOAD, form, {
            headers: { ...this.headers, ...form.getHeaders() },
            params: { ekey: this.KEY, soft_id: "imgedit_web" },
        });
        return this.decrypt(res.data.data);
    }
    async generate(template, styleName, data) {
        const styleId = this.styleMaps[template][styleName];
        const opt = {
            "template": template,
            "seed": Date.now().toString(),
            "style_id": styleId,
            "extra_image_key": data?.data?.image,
        };
        const res = await axios_1.default.post(this.GENERATE, opt, {
            headers: this.headers,
            params: { ekey: this.KEY, soft_id: "imgedit_web" },
        });
        return this.decrypt(res.data.data);
    }
    async process(data) {
        while (true) {
            const res = await axios_1.default.get(this.TASK + data.data.task_id, {
                headers: this.headers,
                params: { ekey: this.KEY, soft_id: "imgedit_web" },
            });
            const dec = this.decrypt(res.data.data);
            if (dec.data.status === 2 && dec.data.images !== null) {
                const base64String = dec.data.images[0].split(',')[1];
                return buffer_1.Buffer.from(base64String, 'base64');
            }
            await this.delay(1000);
        }
    }
}
async function scrapePhotoToCartoonFromUrl(imageUrl, template, styleName) {
    const cartoon = new PhotoToCartoonAPI();
    await cartoon.fetchKeys();
    const { data } = await axios_1.default.get(proxy() + imageUrl, { responseType: "arraybuffer", timeout: 15000 });
    const buffer = buffer_1.Buffer.from(data);
    const urlPath = new URL(imageUrl).pathname;
    const fileName = path_1.default.basename(urlPath);
    const uploadData = await cartoon.upload(buffer, fileName);
    const taskData = await cartoon.generate(template, styleName, uploadData);
    return await cartoon.process(taskData);
}
async function scrapePhotoToCartoonFromFile(fileBuffer, fileName, template, styleName) {
    const cartoon = new PhotoToCartoonAPI();
    await cartoon.fetchKeys();
    const uploadData = await cartoon.upload(fileBuffer, fileName);
    const taskData = await cartoon.generate(template, styleName, uploadData);
    return await cartoon.process(taskData);
}
export default [
    {
        metode: "GET",
        endpoint: "/api/imgedit/convphoto",
        name: "convert photo",
        category: "ImgEdit",
        description: "Convert a photo to a cartoon style using a URL and specified template/style.",
        tags: ["IMGEDIT", "Image Conversion", "Cartoon", "AI"],
        example: "?image=https://i.pinimg.com/736x/0b/9f/0a/0b9f0a92a598e6c22629004c1027d23f.jpg&template=sketch_v2&style=manga_sketch",
        parameters: [
            {
                name: "image",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                    minLength: 1,
                    maxLength: 2000,
                },
                description: "Image URL",
                example: "https://i.pinimg.com/736x/0b/9f/0a/0b9f0a92a598e6c22629004c1027d23f.jpg",
            },
            {
                name: "template",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    enum: ["sketch_v2", "anime"],
                },
                description: "The cartoon template to apply. Available: sketch_v2, anime.",
                example: "sketch_v2",
            },
            {
                name: "style",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 50,
                },
                description: "The specific style within the chosen template.",
                example: "manga_sketch",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { image, template, style } = req.query || {};
            if (!image) {
                return {
                    status: false,
                    error: "Parameter 'image' is required.",
                    code: 400,
                };
            }
            if (typeof image !== "string" || image.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'image' must be a non-empty string.",
                    code: 400,
                };
            }
            const cartoonApiInstance = new PhotoToCartoonAPI();
            const availableTemplates = Object.keys(cartoonApiInstance.styleMaps);
            if (!template) {
                return {
                    status: false,
                    error: "Parameter 'template' is required. Available templates: " + availableTemplates.join(', '),
                    code: 400,
                };
            }
            if (typeof template !== "string" || !availableTemplates.includes(template.trim())) {
                return {
                    status: false,
                    error: "Invalid template. Available templates: " + availableTemplates.join(', '),
                    code: 400,
                };
            }
            if (!style) {
                return {
                    status: false,
                    error: "Parameter 'style' is required. Available styles for '" + template.trim() + "': " +
                        Object.keys(cartoonApiInstance.styleMaps[template.trim()]).join(', '),
                    code: 400,
                };
            }
            if (typeof style !== "string" || !cartoonApiInstance.styleMaps[template.trim()][style.trim()]) {
                return {
                    status: false,
                    error: "Invalid style for template '" + template.trim() + "'. Available styles: " +
                        Object.keys(cartoonApiInstance.styleMaps[template.trim()]).join(', '),
                    code: 400,
                };
            }
            try {
                const imageUrl = new URL(image.trim());
                const resultImage = await scrapePhotoToCartoonFromUrl(imageUrl.href, template.trim(), style.trim());
                const fileType = await (0, file_type_1.fileTypeFromBuffer)(resultImage);
                const contentType = fileType ? fileType.mime : "image/png";
                return createImageResponse(resultImage, `cartoon_image.${fileType?.ext || "png"}`);
            }
            catch (error) {
                console.error("Error:", error);
                return {
                    status: false,
                    error: error.message || "An error occurred while processing the image.",
                    code: 500,
                };
            }
        },
    }
];
