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
import * as path from 'path';
import jimp_1 from 'jimp';
import file_type_1 from 'file-type';
import __form_data_1 from 'form-data';
const form_data_1 = { default: __form_data_1 };
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
class CompressImageAPI {
    api;
    server;
    taskId;
    token;
    height;
    width;
    constructor() {
        this.api = null;
        this.server = null;
        this.taskId = null;
        this.token = null;
        this.height = null;
        this.width = null;
    }
    async getTaskId() {
        try {
            const { data: html } = await axios_1.default.get("https://www.iloveimg.com/blur-face", {
                timeout: 10000,
            });
            const tokenMatches = html.match(/(ey[a-zA-Z0-9?%-_/]+)/g);
            if (!tokenMatches || tokenMatches.length < 2) {
                throw new Error("Token not found.");
            }
            this.token = tokenMatches[1];
            const configMatch = html.match(/var ilovepdfConfig = ({.*?});/s);
            if (!configMatch) {
                throw new Error("Server configuration not found.");
            }
            const configJson = JSON.parse(configMatch[1]);
            const servers = configJson.servers;
            if (!Array.isArray(servers) || servers.length === 0) {
                throw new Error("Server list is empty.");
            }
            this.server = servers[Math.floor(Math.random() * servers.length)];
            this.taskId = html.match(/taskId\s*=\s*'(\w+)/)?.[1];
            if (!this.taskId) {
                throw new Error("Task ID not found!");
            }
            this.api = axios_1.default.create({
                baseURL: `https://${this.server}.iloveimg.com`,
                timeout: 30000,
            });
            this.api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
            return { taskId: this.taskId };
        }
        catch (error) {
            throw new Error(`Failed to get Task ID: ${error.message}`);
        }
    }
    async uploadFromUrl(imageUrl) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API is not available. Run getTaskId() first.");
        }
        try {
            const imageResponse = await axios_1.default.get(imageUrl, {
                responseType: "arraybuffer",
                timeout: 15000,
            });
            const fileType = await (0, file_type_1.fileTypeFromBuffer)(imageResponse.data);
            if (!fileType || !fileType.mime.startsWith("image/")) {
                throw new Error("Unsupported image file type.");
            }
            const image = await jimp_1.Jimp.read(imageResponse.data);
            this.width = image.bitmap.width;
            this.height = image.bitmap.height;
            const buffer = Buffer.from(imageResponse.data);
            const urlPath = new URL(imageUrl).pathname;
            const fileName = path.basename(urlPath) || `image.${fileType.ext}`;
            const form = new form_data_1.default();
            form.append("name", fileName);
            form.append("chunk", "0");
            form.append("chunks", "1");
            form.append("task", this.taskId);
            form.append("preview", "1");
            form.append("pdfinfo", "0");
            form.append("pdfforms", "0");
            form.append("pdfresetforms", "0");
            form.append("v", "web.0");
            form.append("file", buffer, { filename: fileName, contentType: fileType.mime });
            const response = await this.api.post("/v1/upload", form, {
                headers: {
                    ...form.getHeaders(),
                    "Content-Length": form.getLengthSync(),
                },
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    async uploadFromFile(fileBuffer, fileName) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API is not available. Run getTaskId() first.");
        }
        try {
            const fileType = await (0, file_type_1.fileTypeFromBuffer)(fileBuffer);
            if (!fileType || !fileType.mime.startsWith("image/")) {
                throw new Error("Unsupported image file type.");
            }
            const image = await jimp_1.Jimp.read(fileBuffer);
            this.width = image.bitmap.width;
            this.height = image.bitmap.height;
            const form = new form_data_1.default();
            form.append("name", fileName);
            form.append("chunk", "0");
            form.append("chunks", "1");
            form.append("task", this.taskId);
            form.append("preview", "1");
            form.append("pdfinfo", "0");
            form.append("pdfforms", "0");
            form.append("pdfresetforms", "0");
            form.append("v", "web.0");
            form.append("file", fileBuffer, { filename: fileName, contentType: fileType.mime });
            const response = await this.api.post("/v1/upload", form, {
                headers: {
                    ...form.getHeaders(),
                    "Content-Length": form.getLengthSync(),
                },
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    async faceDetection(serverFilename) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API is not available. Run getTaskId() first.");
        }
        const form = new form_data_1.default();
        form.append("task", this.taskId);
        form.append("level", "recommended");
        form.append("fileArray[0][server_filename]", serverFilename);
        try {
            const response = await this.api.post("/v1/detectfaces", form, {
                headers: {
                    ...form.getHeaders(),
                    "Content-Length": form.getLengthSync(),
                },
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to perform face detection: ${error.message}`);
        }
    }
    async processImage(serverFilename, originalFilename) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API is not available. Run getTaskId() first.");
        }
        const form = new form_data_1.default();
        form.append("packaged_filename", "iloveimg-blurred");
        form.append("width", this.width);
        form.append("height", this.height);
        form.append("level", "recommended");
        form.append("mode", "include");
        form.append("task", this.taskId);
        form.append("tool", "blurfaceimage");
        form.append("files[0][server_filename]", serverFilename);
        form.append("files[0][filename]", originalFilename);
        try {
            await this.api.post("/v1/process", form, {
                headers: {
                    ...form.getHeaders(),
                    "Content-Length": form.getLengthSync(),
                },
            });
            const downloadResponse = await this.api.get(`/v1/download/${this.taskId}`, {
                responseType: "arraybuffer",
            });
            return downloadResponse.data;
        }
        catch (error) {
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }
}
async function scrapeBlurFaceFromUrl(imageUrl) {
    const compressor = new CompressImageAPI();
    await compressor.getTaskId();
    const uploadResult = await compressor.uploadFromUrl(imageUrl);
    if (!uploadResult?.server_filename) {
        throw new Error("Failed to upload image: Server filename not found.");
    }
    const originalFilename = path.basename(new URL(imageUrl).pathname) || "image.jpg";
    const blurredImageBuffer = await compressor.processImage(uploadResult.server_filename, originalFilename);
    return blurredImageBuffer;
}
async function scrapeBlurFaceFromFile(fileBuffer, fileName) {
    const compressor = new CompressImageAPI();
    await compressor.getTaskId();
    const uploadResult = await compressor.uploadFromFile(fileBuffer, fileName);
    if (!uploadResult?.server_filename) {
        throw new Error("Failed to upload image: Server filename not found.");
    }
    const blurredImageBuffer = await compressor.processImage(uploadResult.server_filename, fileName);
    return blurredImageBuffer;
}
export default [
    {
        metode: "GET",
        endpoint: "/api/iloveimg/blurface",
        name: "blurface",
        category: "Iloveimg",
        description: "This API blurs faces detected in an image provided via a URL.",
        tags: ["ILOVEIMG", "Image Processing", "Privacy"],
        example: "?image=https://i.pinimg.com/736x/0b/9f/0a/0b9f0a92a598e6c22629004c1027d23f.jpg",
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
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { image } = req.query || {};
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
            try {
                new URL(image.trim());
            }
            catch (e) {
                return {
                    status: false,
                    error: "Invalid URL format for 'image' parameter.",
                    code: 400,
                };
            }
            try {
                const blurredImageBuffer = await scrapeBlurFaceFromUrl(image.trim());
                const fileType = await (0, file_type_1.fileTypeFromBuffer)(blurredImageBuffer);
                const contentType = fileType ? fileType.mime : "application/octet-stream";
                const filename = `blurred_image.${fileType?.ext || "png"}`;
                return createImageResponse(blurredImageBuffer, filename);
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
