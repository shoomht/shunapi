var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const classifyImage = async (imageUrl, model) => {
    try {
        const { data } = await axios_1.default.post(CloudflareAi() + "/image-classification", {
            model: model,
            imageUrl: imageUrl,
        }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
                Referer: "https://ai.clauodflare.workers.dev/",
            },
            timeout: 30000,
        });
        return data.data;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to classify image from API");
    }
};
export default [
    {
        metode: "GET",
        endpoint: "/api/cf/image-classification",
        name: "image classification",
        category: "CloudflareAi",
        description: "This API endpoint performs image classification using a Cloudflare AI model.",
        tags: ["AI", "Image Processing", "Cloudflare", "Classification"],
        example: "?imageUrl=https://cataas.com/cat&model=@cf/microsoft/resnet-50",
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
                description: "The URL of the image to classify",
                example: "https://cataas.com/cat",
            },
            {
                name: "model",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "Custom AI model to use for classification",
                example: "@cf/microsoft/resnet-50",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { imageUrl, model } = req.query || {};
            if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter 'imageUrl' is required and must be a non-empty string",
                    code: 400,
                };
            }
            if (!/^https?:\/\/\S+$/.test(imageUrl.trim())) {
                return {
                    status: false,
                    error: "Invalid URL format for 'imageUrl'",
                    code: 400,
                };
            }
            const classificationModel = typeof model === "string" && model.trim().length > 0 ? model.trim() : "@cf/microsoft/resnet-50";
            try {
                const result = await classifyImage(imageUrl.trim(), classificationModel);
                if (!result) {
                    return {
                        status: false,
                        error: "No classification result for the provided image",
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
