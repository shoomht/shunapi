import buffer_1 from 'buffer';
async function scrape(base64) {
    try {
        const text = buffer_1.Buffer.from(base64, "base64").toString("utf-8");
        return { text: text };
    }
    catch (error) {
        throw new Error("Invalid Base64 string provided.");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/base642text",
        name: "base642text",
        category: "Tools",
        description: "This API endpoint decodes a Base64 encoded string into plain text.",
        tags: ["TOOLS", "ENCODING", "DECODING", "BASE64"],
        example: "?base64=SGVsbG8gV29ybGQ=",
        parameters: [
            {
                name: "base64",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 5000,
                },
                description: "The Base64 encoded string to decode",
                example: "SGVsbG8gV29ybGQ=",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { base64 } = req.query || {};
            if (!base64) {
                return {
                    status: false,
                    error: "Base64 parameter is required",
                    code: 400,
                };
            }
            if (typeof base64 !== "string" || base64.trim().length === 0) {
                return {
                    status: false,
                    error: "Base64 parameter must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrape(base64.trim());
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
