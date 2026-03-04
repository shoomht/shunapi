var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const chatWithAI = async (messages, model) => {
    try {
        const response = await axios_1.default.post(CloudflareAi() + "/chat", {
            model: model,
            messages: messages,
        }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
                Referer: "https://ai.clauodflare.workers.dev/",
            },
            timeout: 30000,
        });
        return response.data.data;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
};
export default [
    {
        metode: "GET",
        endpoint: "/api/cf/chat",
        name: "chat",
        category: "CloudflareAi",
        description: "This API endpoint allows users to interact with a Cloudflare-powered AI model to get chat responses.",
        tags: ["AI", "Chatbot", "Cloudflare"],
        example: "?prompt=hello&system=you are a helpful assistant&model=@cf/meta/llama-3.1-8b-instruct-fast",
        parameters: [
            {
                name: "prompt",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
                description: "User's message to AI",
                example: "What is the capital of France?",
            },
            {
                name: "system",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
                description: "System instruction for AI",
                example: "You are a helpful assistant.",
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
                description: "Custom AI model to use",
                example: "@cf/meta/llama-3.1-8b-instruct-fast",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { prompt, system, model } = req.query || {};
            if (!prompt && !system) {
                return {
                    status: false,
                    error: "At least one query parameter (prompt or system) is required",
                    code: 400,
                };
            }
            const messages = [];
            if (typeof system === "string" && system.trim().length > 0) {
                messages.push({ role: "system", content: system.trim() });
            }
            if (typeof prompt === "string" && prompt.trim().length > 0) {
                messages.push({ role: "user", content: prompt.trim() });
            }
            if (messages.length === 0) {
                return {
                    status: false,
                    error: "Provided prompt and system parameters are empty or invalid",
                    code: 400,
                };
            }
            const aiModel = typeof model === "string" && model.trim().length > 0 ? model.trim() : "@cf/meta/llama-3.1-8b-instruct-fast";
            try {
                const result = await chatWithAI(messages, aiModel);
                if (!result) {
                    return {
                        status: false,
                        error: "No result returned from AI chat",
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
