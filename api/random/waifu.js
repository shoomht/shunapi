var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import buffer_1 from 'buffer';
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
async function getRandomWaifuImage() {
    try {
        const API_URL = "https://api.waifu.pics/sfw/waifu";
        const { data } = await axios_1.default.get(API_URL, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        if (!data || !data.url) {
            throw new Error("Invalid response from external API: Missing image URL.");
        }
        const imageUrl = data.url;
        const imageResponse = await axios_1.default.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        return buffer_1.Buffer.from(imageResponse.data, "binary");
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get random waifu image from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/r/waifu",
        name: "random waifu",
        category: "Random",
        description: "This API endpoint provides a random waifu image.",
        tags: ["Random", "Image", "Anime", "Waifu"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const imageData = await getRandomWaifuImage();
                return createImageResponse(imageData);
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
