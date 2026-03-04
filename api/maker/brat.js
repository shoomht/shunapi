var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const createImageResponse = (buffer, filename = null, contentType = "image/png") => {
    const headers = {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
    };
    if (filename) {
        headers["Content-Disposition"] = `inline; filename="${filename}"`;
    }
    return new Response(buffer, { headers });
};
async function generateBrat(text, isAnimated, delayMs) {
    try {
        const words = text.trim().split(/\s+/).slice(0, 10);
        const limitedText = words.join(" ");
        if (limitedText.length > 800) {
            throw new Error("Text maksimal 800 karakter");
        }
        // Encode text untuk URL
        const encodedText = encodeURIComponent(limitedText);
        // Pilih endpoint berdasarkan isAnimated
        const apiUrl = isAnimated
            ? `https://brat.siputzx.my.id/gif?text=${encodedText}&delay=${delayMs}`
            : `https://brat.siputzx.my.id/image?text=${encodedText}`;
        // Request ke API eksternal
        const response = await axios_1.default.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30 detik timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const buffer = Buffer.from(response.data);
        if (isAnimated) {
            return { buffer, contentType: "image/gif" };
        }
        else {
            return buffer; // Return buffer langsung untuk static image
        }
    }
    catch (error) {
        console.error("Error calling external Brat API:", error);
        // Handle different error types
        if (error.code === 'ECONNABORTED') {
            throw new Error("Request timeout - API eksternal tidak merespon");
        }
        else if (error.response) {
            throw new Error(`API eksternal error: ${error.response.status} - ${error.response.statusText}`);
        }
        else if (error.request) {
            throw new Error("Tidak dapat terhubung ke API eksternal");
        }
        else {
            throw new Error(`Error: ${error.message}`);
        }
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/m/brat",
        name: "brat",
        category: "Maker",
        description: "Generate a Brat image or animated GIF from text.",
        tags: ["MAKER", "IMAGE", "GIF"],
        example: "?text=hello+world&isAnimated=true&delay=300",
        parameters: [
            {
                name: "text",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 800,
                },
                description: "The text content",
                example: "Hello world!",
            },
            {
                name: "isAnimated",
                in: "query",
                required: false,
                schema: {
                    type: "boolean",
                    default: false,
                },
                description: "Animated GIF",
                example: false,
            },
            {
                name: "delay",
                in: "query",
                required: false,
                schema: {
                    type: "integer",
                    minimum: 100,
                    maximum: 1500,
                    default: 500,
                },
                description: "Delay between words (ms)",
                example: 500,
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { text, isAnimated: isAnimatedParam = "false", delay = "500" } = req.query || {};
            if (!text) {
                return {
                    status: false,
                    error: "Parameter text is required",
                    code: 400,
                };
            }
            if (typeof text !== "string" || text.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter text must be a non-empty string",
                    code: 400,
                };
            }
            if (text.length > 800) {
                return {
                    status: false,
                    error: "Text must be less than or equal to 800 characters",
                    code: 400,
                };
            }
            const isAnimated = String(isAnimatedParam).toLowerCase() === "true";
            const delayMs = Math.max(100, Math.min(1500, parseInt(String(delay)) || 500));
            try {
                const result = await generateBrat(text.trim(), isAnimated, delayMs);
                if (isAnimated && typeof result === "object" && "buffer" in result && "contentType" in result) {
                    return createImageResponse(result.buffer, null, result.contentType);
                }
                else if (result instanceof Buffer) {
                    return createImageResponse(result, null, "image/png"); // API eksternal return PNG untuk static
                }
                else {
                    return {
                        status: false,
                        error: "Unexpected result format from Brat generator",
                        code: 500,
                    };
                }
            }
            catch (error) {
                console.error("Error in brat generator:", error);
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    }
];
