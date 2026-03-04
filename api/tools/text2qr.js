var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __qrcode_1 from 'qrcode';
const qrcode_1 = { default: __qrcode_1 };
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
async function generateQrCodeBuffer(text) {
    return new Promise((resolve, reject) => {
        qrcode_1.default.toBuffer(text, {
            errorCorrectionLevel: "H",
            type: "png",
            quality: 1,
            width: 1024,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        }, (err, buffer) => {
            if (err) {
                return reject(new Error("Failed to generate QR code"));
            }
            resolve(buffer);
        });
    });
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/text2qr",
        name: "text2qr",
        category: "Tools",
        description: "This API endpoint generates a high-quality QR code image from any provided text string.",
        tags: ["TOOLS", "QR Code", "Generator"],
        example: "?text=Hello%20World",
        parameters: [
            {
                name: "text",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 2000,
                },
                description: "Text for QR code",
                example: "Hello World",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { text } = req.query || {};
            if (!text) {
                return {
                    status: false,
                    error: "Text parameter is required",
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
            try {
                const qrBuffer = await generateQrCodeBuffer(text.trim());
                return createImageResponse(qrBuffer);
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
