var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import buffer_1 from 'buffer';
const createImageResponse = (buffer, filename = null) => {
    const headers = {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
    };
    if (filename) {
        headers["Content-Disposition"] = `inline; filename="${filename}"`;
    }
    return new Response(buffer, { headers });
};
async function getTtsAudio(text, voice, rate, pitch, volume) {
    const apiUrl = `https://iniapi-tts.hf.space/generate?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(rate)}&volume=${encodeURIComponent(volume)}&pitch=${encodeURIComponent(pitch)}`;
    try {
        const response = await axios_1.default.get(apiUrl, {
            headers: {
                "accept": "*/*",
                "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": '"Not-A.Brand";v="99", "Chromium";v="124"',
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": '"Android"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
            responseType: "arraybuffer",
            timeout: 30000,
        });
        return buffer_1.Buffer.from(response.data);
    }
    catch (error) {
        console.error("TTS API Error:", error.message);
        throw new Error(`Failed to generate TTS audio: ${error.message}`);
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/tts",
        name: "tts",
        category: "Tools",
        description: "This API endpoint converts text into speech (TTS) using a highly customizable synthesis engine.",
        tags: ["TOOLS", "TTS", "Speech"],
        example: "?text=halo%20piye%20kabare&voice=jv-ID-DimasNeural&rate=0%25&pitch=0Hz&volume=0%25",
        parameters: [
            {
                name: "text",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
                description: "Text to convert",
                example: "halo piye kabare",
            },
            {
                name: "voice",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "Voice for TTS",
                example: "jv-ID-DimasNeural",
            },
            {
                name: "rate",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 10,
                },
                description: "Speech rate",
                example: "0%",
            },
            {
                name: "pitch",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 10,
                },
                description: "Speech pitch",
                example: "0Hz",
            },
            {
                name: "volume",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 10,
                },
                description: "Speech volume",
                example: "0%",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { text, voice, rate, pitch, volume } = req.query || {};
            if (!text || !voice || !rate || !pitch || !volume) {
                return {
                    status: false,
                    error: "All parameters (text, voice, rate, pitch, volume) must be provided",
                    code: 400,
                };
            }
            if (typeof text !== "string" || text.trim().length === 0) {
                return {
                    status: false,
                    error: "Text must be a non-empty string",
                    code: 400,
                };
            }
            if (typeof voice !== "string" || voice.trim().length === 0) {
                return {
                    status: false,
                    error: "Voice must be a non-empty string",
                    code: 400,
                };
            }
            if (typeof rate !== "string" || rate.trim().length === 0) {
                return {
                    status: false,
                    error: "Rate must be a non-empty string",
                    code: 400,
                };
            }
            if (typeof pitch !== "string" || pitch.trim().length === 0) {
                return {
                    status: false,
                    error: "Pitch must be a non-empty string",
                    code: 400,
                };
            }
            if (typeof volume !== "string" || volume.trim().length === 0) {
                return {
                    status: false,
                    error: "Volume must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const audioBuffer = await getTtsAudio(text.trim(), voice.trim(), rate.trim(), pitch.trim(), volume.trim());
                return createImageResponse(audioBuffer, "audio.wav");
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
