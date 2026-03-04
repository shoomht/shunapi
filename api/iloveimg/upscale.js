var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import file_type_1 from 'file-type';
import __path_1 from 'path';
const path_1 = { default: __path_1 };
import buffer_1 from 'buffer';
import __form_data_1 from 'form-data';
const form_data_1 = { default: __form_data_1 };
const createImageResponse = (buffer, filename = null) => {
    const headers = {
        "Content-Type": "image/jpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
    };
    if (filename) {
        headers["Content-Disposition"] = `inline; filename="${filename}"`;
    }
    return new Response(buffer, { headers });
};
class UpscaleImageAPI {
    api;
    server;
    taskId;
    token;
    constructor() {
        this.api = null;
        this.server = null;
        this.taskId = null;
        this.token = null;
    }
    async getTaskId() {
        try {
            const { data: html } = await axios_1.default.get("https://www.iloveimg.com/upscale-image", {
                headers: {
                    "Accept": "*/*",
                    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Connection": "keep-alive",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
                    "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
                    "sec-ch-ua-mobile": "?1",
                    "sec-ch-ua-platform": '"Android"',
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                    "Sec-Fetch-User": "?1",
                },
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
            this.taskId = html.match(/ilovepdfConfig\.taskId\s*=\s*['"](\w+)['"]/)?.[1];
            this.api = axios_1.default.create({
                baseURL: `https://${this.server}.iloveimg.com`,
                headers: {
                    "Accept": "*/*",
                    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Authorization": `Bearer ${this.token}`,
                    "Connection": "keep-alive",
                    "Origin": "https://www.iloveimg.com",
                    "Referer": "https://www.iloveimg.com/",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
                    "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
                    "sec-ch-ua-mobile": "?1",
                    "sec-ch-ua-platform": '"Android"',
                },
            });
            if (!this.taskId)
                throw new Error("Task ID not found!");
            return { taskId: this.taskId, server: this.server, token: this.token };
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
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
                },
                timeout: 15000,
            });
            const fileType = await (0, file_type_1.fileTypeFromBuffer)(imageResponse.data);
            if (!fileType || !fileType.mime.startsWith("image/")) {
                throw new Error("File type is not a supported image.");
            }
            const buffer = buffer_1.Buffer.from(imageResponse.data, "binary");
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
                headers: form.getHeaders(),
                data: form,
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
                headers: form.getHeaders(),
                data: form,
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    async upscaleImage(serverFilename, scale = 2) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API not available. Run getTaskId() first.");
        }
        if (scale !== 2 && scale !== 4) {
            throw new Error("Scale can only be 2 or 4.");
        }
        try {
            const form = new form_data_1.default();
            form.append("task", this.taskId);
            form.append("server_filename", serverFilename);
            form.append("scale", scale.toString());
            const response = await this.api.post("/v1/upscale", form, {
                headers: form.getHeaders(),
                data: form,
                responseType: "arraybuffer",
            });
            return response.data;
        }
        catch (error) {
            console.error("Error detail:", error.response ? error.response.data : error);
            throw new Error(`Failed to perform upscaling: ${error.message}`);
        }
    }
    async downloadResult() {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API not available. Run getTaskId() first.");
        }
        try {
            const response = await this.api.get(`/v1/download/${this.taskId}`, {
                responseType: "arraybuffer",
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to download result file: ${error.message}`);
        }
    }
}
async function scrapeUpscaleFromUrl(imageUrl, scale) {
    const upscaler = new UpscaleImageAPI();
    await upscaler.getTaskId();
    const uploadResult = await upscaler.uploadFromUrl(imageUrl);
    if (!uploadResult || !uploadResult.server_filename) {
        throw new Error("Failed to upload image.");
    }
    const imageBuffer = await upscaler.upscaleImage(uploadResult.server_filename, scale);
    return imageBuffer;
}
async function scrapeUpscaleFromFile(fileBuffer, fileName, scale) {
    const upscaler = new UpscaleImageAPI();
    await upscaler.getTaskId();
    const uploadResult = await upscaler.uploadFromFile(fileBuffer, fileName);
    if (!uploadResult || !uploadResult.server_filename) {
        throw new Error("Failed to upload image.");
    }
    const imageBuffer = await upscaler.upscaleImage(uploadResult.server_filename, scale);
    return imageBuffer;
}
export default [
    {
        metode: "GET",
        endpoint: "/api/iloveimg/upscale",
        name: "upscale",
        category: "Iloveimg",
        description: "Upscale an image by providing its URL.",
        tags: ["ILOVEIMG", "Image Upscale", "Image Enhancement"],
        example: "?image=https://i.pinimg.com/736x/0b/9f/0a/0b9f0a92a598e6c22629004c1027d23f.jpg&scale=2",
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
                name: "scale",
                in: "query",
                required: false,
                schema: {
                    type: "integer",
                    enum: [2, 4],
                    default: 2,
                },
                description: "Upscale factor (2 or 4). Defaults to 2.",
                example: "2",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { image } = req.query || {};
            const scale = req.query.scale ? parseInt(req.query.scale) : 2;
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
            if (typeof scale !== "number" || (scale !== 2 && scale !== 4)) {
                return {
                    status: false,
                    error: "Parameter 'scale' must be 2 or 4.",
                    code: 400,
                };
            }
            try {
                new URL(image.trim());
                const imageBuffer = await scrapeUpscaleFromUrl(image.trim(), scale);
                const fileType = await (0, file_type_1.fileTypeFromBuffer)(imageBuffer);
                const contentType = fileType ? fileType.mime : "image/jpeg";
                return createImageResponse(imageBuffer, `upscaled_image.${fileType?.ext || "jpeg"}`);
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
