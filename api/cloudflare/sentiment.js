var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const analyzeSentiment = async (text, model) => {
    try {
        const { data } = await axios_1.default.post(CloudflareAi() + "/sentiment", {
            model: model,
            text: text,
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
        throw new Error("Failed to analyze sentiment from API");
    }
};
export default [
    {
        metode: "GET",
        endpoint: "/api/cf/sentiment",
        name: "sentiment",
        category: "CloudflareAi",
        description: "This API endpoint analyzes the sentiment of a given text using a Cloudflare AI model.",
        tags: ["AI", "NLP", "Cloudflare", "Sentiment Analysis"],
        example: "?text=I%20love%20this%20product%21&model=@cf/huggingface/distilbert-sst-2-int8",
        parameters: [
            {
                name: "text",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 5000,
                },
                description: "The text to analyze sentiment for",
                example: "This is a great day!",
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
                description: "Custom AI model to use for sentiment analysis",
                example: "@cf/huggingface/distilbert-sst-2-int8",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { text, model } = req.query || {};
            if (typeof text !== "string" || text.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter 'text' is required and must be a non-empty string",
                    code: 400,
                };
            }
            if (text.length > 5000) {
                return {
                    status: false,
                    error: "Text must be less than 5000 characters",
                    code: 400,
                };
            }
            const sentimentModel = typeof model === "string" && model.trim().length > 0 ? model.trim() : "@cf/huggingface/distilbert-sst-2-int8";
            try {
                const result = await analyzeSentiment(text.trim(), sentimentModel);
                if (!result) {
                    return {
                        status: false,
                        error: "No sentiment analysis result for the provided text",
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
