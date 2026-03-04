var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const translateText = async (text, sourceLang, targetLang, model) => {
    try {
        const { data } = await axios_1.default.post(CloudflareAi() + "/translation", {
            model: model,
            text: text,
            source_lang: sourceLang,
            target_lang: targetLang,
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
        throw new Error("Failed to translate text from API");
    }
};
export default [
    {
        metode: "GET",
        endpoint: "/api/cf/translation",
        name: "translation",
        category: "CloudflareAi",
        description: "This API endpoint provides text translation services using a Cloudflare AI model.",
        tags: ["AI", "Translation", "Cloudflare", "NLP", "Language"],
        example: "?text=Hello%20world&sourceLang=en&targetLang=id&model=@cf/meta/m2m100-1.2b",
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
                description: "The text to translate",
                example: "The quick brown fox jumps over the lazy dog.",
            },
            {
                name: "sourceLang",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 2,
                    maxLength: 10,
                },
                description: "The source language code (e.g., en, id)",
                example: "en",
            },
            {
                name: "targetLang",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 2,
                    maxLength: 10,
                },
                description: "The target language code (e.g., id, es)",
                example: "id",
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
                description: "Custom AI model to use for translation",
                example: "@cf/meta/m2m100-1.2b",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { text, sourceLang, targetLang, model } = req.query || {};
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
            if (typeof sourceLang !== "string" || sourceLang.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter 'sourceLang' is required and must be a non-empty string",
                    code: 400,
                };
            }
            if (typeof targetLang !== "string" || targetLang.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter 'targetLang' is required and must be a non-empty string",
                    code: 400,
                };
            }
            const translationModel = typeof model === "string" && model.trim().length > 0 ? model.trim() : "@cf/meta/m2m100-1.2b";
            try {
                const result = await translateText(text.trim(), sourceLang.trim(), targetLang.trim(), translationModel);
                if (!result) {
                    return {
                        status: false,
                        error: "No translation result for the provided text",
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
