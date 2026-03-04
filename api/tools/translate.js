var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function translateText(text, source, target) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const response = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = response.data;
        return data?.[0]?.[0]?.[0] || "Translation not found.";
    }
    catch (error) {
        console.error("Translation API Error:", error.message);
        throw new Error(`Failed to translate text: ${error.message}`);
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/translate",
        name: "translate",
        category: "Tools",
        description: "This API endpoint provides text translation services, allowing you to convert text from one language to another.",
        tags: ["TOOLS", "Translate", "Language"],
        example: "?text=I%20love%20you&source=auto&target=id",
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
                description: "Text to translate",
                example: "I love you",
            },
            {
                name: "source",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    default: "auto",
                },
                description: "Source language code",
                example: "en",
            },
            {
                name: "target",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    default: "id",
                },
                description: "Target language code",
                example: "id",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { text, source = "auto", target = "id" } = req.query || {};
            if (!text) {
                return {
                    status: false,
                    error: "Parameter 'text' is required.",
                    code: 400,
                };
            }
            if (typeof text !== "string" || text.trim().length === 0) {
                return {
                    status: false,
                    error: "Text must be a non-empty string.",
                    code: 400,
                };
            }
            if (typeof source !== "string" || source.trim().length === 0) {
                return {
                    status: false,
                    error: "Source language must be a non-empty string.",
                    code: 400,
                };
            }
            if (typeof target !== "string" || target.trim().length === 0) {
                return {
                    status: false,
                    error: "Target language must be a non-empty string.",
                    code: 400,
                };
            }
            try {
                const translatedText = await translateText(text.trim(), source.trim(), target.trim());
                return {
                    status: true,
                    data: {
                        translatedText: translatedText,
                    },
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                return {
                    status: false,
                    error: error.message || "An error occurred during translation.",
                    code: 500,
                };
            }
        },
    }
];
