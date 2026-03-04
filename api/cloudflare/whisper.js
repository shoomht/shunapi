var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const speechToText = async (audioUrl, model) => {
    try {
        const { data } = await axios_1.default.post(CloudflareAi() + "/speech-to-text", {
            model: model,
            audioUrl: audioUrl,
        }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
                Referer: "https://ai.clauodflare.workers.dev/",
            },
            timeout: 30000,
        });
        return data;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to convert speech to text from API");
    }
};
export default [
    {
        metode: "GET",
        endpoint: "/api/cf/whisper",
        name: "whisper",
        category: "CloudflareAi",
        description: "This API endpoint transcribes speech from an audio URL into text using a Cloudflare AI model, specifically the Whispe...",
        tags: ["AI", "Speech-to-Text", "Cloudflare", "Audio Processing", "Whisper"],
        example: "audioUrl=https://github.com/Azure-Samples/cognitive-services-speech-sdk/raw/master/samples/cpp/windows/console/samples/enrollment_audio_katie.wav&model=@cf/openai/whisper",
        parameters: [
            {
                name: "audioUrl",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                    minLength: 1,
                    maxLength: 2048,
                },
                description: "The URL of the audio file to transcribe",
                example: "https://github.com/Azure-Samples/cognitive-services-speech-sdk/raw/master/samples/cpp/windows/console/samples/enrollment_audio_katie.wav",
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
                description: "Custom AI model to use for speech-to-text",
                example: "@cf/openai/whisper",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { audioUrl, model } = req.query || {};
            if (typeof audioUrl !== "string" || audioUrl.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter 'audioUrl' is required and must be a non-empty string",
                    code: 400,
                };
            }
            if (!/^https?:\/\/\S+$/.test(audioUrl.trim())) {
                return {
                    status: false,
                    error: "Invalid URL format for 'audioUrl'",
                    code: 400,
                };
            }
            const sttModel = typeof model === "string" && model.trim().length > 0 ? model.trim() : "@cf/openai/whisper";
            try {
                const result = await speechToText(audioUrl.trim(), sttModel);
                if (!result) {
                    return {
                        status: false,
                        error: "No transcription result for the provided audio",
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
