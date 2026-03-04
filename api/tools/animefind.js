var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import __form_data_1 from 'form-data';
const form_data_1 = { default: __form_data_1 };
import file_type_1 from 'file-type';
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
];
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
async function validateImageBuffer(buffer) {
    try {
        const fileType = await (0, file_type_1.fileTypeFromBuffer)(buffer);
        if (!fileType) {
            throw new Error("Could not detect file type");
        }
        if (!ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
            throw new Error(`Unsupported file type: ${fileType.mime}. Only image files are allowed.`);
        }
        return {
            isValid: true,
            mime: fileType.mime,
            ext: fileType.ext,
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: error.message,
        };
    }
}
async function processImageIdentification(imageBuffer) {
    const form = new form_data_1.default();
    form.append("image", imageBuffer, {
        filename: "anime.jpg",
        contentType: "image/jpeg",
    });
    try {
        const response = await axios_1.default.post("https://www.animefinder.xyz/api/identify", form, {
            headers: {
                ...form.getHeaders(),
                "Origin": "https://www.animefinder.xyz",
                "Referer": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            maxBodyLength: Infinity,
            timeout: 30000,
        });
        const result = response.data;
        return {
            status: true,
            anime: result.animeTitle,
            character: result.character,
            genres: result.genres,
            premiere: result.premiereDate,
            production: result.productionHouse,
            description: result.description,
            synopsis: result.synopsis,
            references: result.references || [],
        };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error(error.response?.data?.error || "Failed to identify anime from image");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/identify-anime",
        name: "identify anime",
        category: "Tools",
        description: "This API endpoint allows users to identify an anime from an image URL.",
        tags: ["ANIME", "IMAGE", "RECOGNITION"],
        example: "?imageUrl=https://files.catbox.moe/57d96s.jpg",
        parameters: [
            {
                name: "imageUrl",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                    minLength: 1,
                    maxLength: 2048,
                },
                description: "URL of the image to identify",
                example: "https://files.catbox.moe/57d96s.jpg",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { imageUrl } = req.query || {};
            if (!imageUrl) {
                return {
                    status: false,
                    error: "Parameter 'imageUrl' is required.",
                    code: 400,
                };
            }
            if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'imageUrl' must be a non-empty string.",
                    code: 400,
                };
            }
            try {
                const imageBuffer = (await axios_1.default.get(imageUrl.trim(), {
                    responseType: "arraybuffer",
                    timeout: 30000,
                })).data;
                const validation = await validateImageBuffer(Buffer.from(imageBuffer));
                if (!validation.isValid) {
                    return {
                        status: false,
                        error: validation.error || "File is not a valid image.",
                        code: 400,
                    };
                }
                const result = await processImageIdentification(imageBuffer);
                return {
                    status: true,
                    data: {
                        ...result,
                        image: imageUrl.trim(),
                    },
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
