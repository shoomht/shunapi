var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import jimp_1 from 'jimp';
import file_type_1 from 'file-type';
import __path_1 from 'path';
const path_1 = { default: __path_1 };
import buffer_1 from 'buffer';
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
            const { data: html } = await axios_1.default.get("https://www.iloveimg.com/compress-image", {
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
            throw new Error("Task ID or API not available. Run getTaskId() first.");
        }
        try {
            const imageResponse = await axios_1.default.get(imageUrl, {
                responseType: "arraybuffer",
                timeout: 15000,
            });
            const fileType = await (0, file_type_1.fileTypeFromBuffer)(imageResponse.data);
            if (!fileType || !fileType.mime.startsWith("image/")) {
                throw new Error("File type is not a supported image.");
            }
            const image = await jimp_1.Jimp.read(imageResponse.data);
            this.width = image.bitmap.width;
            this.height = image.bitmap.height;
            const buffer = buffer_1.Buffer.from(imageResponse.data);
            const urlPath = new URL(imageUrl).pathname;
            const fileName = path_1.default.basename(urlPath) || `image.${fileType.ext}`;
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
            throw new Error("Task ID or API not available. Run getTaskId() first.");
        }
        try {
            const fileType = await (0, file_type_1.fileTypeFromBuffer)(fileBuffer);
            if (!fileType || !fileType.mime.startsWith("image/")) {
                throw new Error("File type is not a supported image.");
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
    async compressImage(serverFilename, originalFilename) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API not available. Run getTaskId() first.");
        }
        const form = new form_data_1.default();
        form.append("compression_", "recommended");
        form.append("width", this.width);
        form.append("height", this.height);
        form.append("task", this.taskId);
        form.append("tool", "compressimage");
        form.append("packaged_filename", "iloveimg-compressed");
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
            throw new Error(`Failed to perform compression: ${error.message}`);
        }
    }
}
async function scrapeCompressImageFromUrl(imageUrl) {
    const compressor = new CompressImageAPI();
    await compressor.getTaskId();
    const uploadResult = await compressor.uploadFromUrl(imageUrl);
    if (!uploadResult?.server_filename) {
        throw new Error("Failed to upload image: Server filename not found.");
    }
    const originalFilename = path_1.default.basename(new URL(imageUrl).pathname) || "image.jpg";
    const compressedImage = await compressor.compressImage(uploadResult.server_filename, originalFilename);
    return compressedImage;
}
async function scrapeCompressImageFromFile(fileBuffer, fileName) {
    const compressor = new CompressImageAPI();
    await compressor.getTaskId();
    const uploadResult = await compressor.uploadFromFile(fileBuffer, fileName);
    if (!uploadResult?.server_filename) {
        throw new Error("Failed to upload image: Server filename not found.");
    }
    const compressedImage = await compressor.compressImage(uploadResult.server_filename, fileName);
    return compressedImage;
}
export default [
    {
        metode: "GET",
        endpoint: "/api/iloveimg/compress",
        name: "compress",
        category: "Iloveimg",
        description: "Compress an image by providing its URL.",
        tags: ["ILOVEIMG", "Image Compression", "Image Optimization"],
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
                const compressedImageBuffer = await scrapeCompressImageFromUrl(image.trim());
                const fileType = await (0, file_type_1.fileTypeFromBuffer)(compressedImageBuffer);
                const contentType = fileType ? fileType.mime : "application/octet-stream";
                return createImageResponse(compressedImageBuffer, `compressed_image.${fileType?.ext || "bin"}`);
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
