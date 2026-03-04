import buffer_1 from 'buffer';
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/text2base64",
        name: "text2base64",
        category: "Tools",
        description: "This API endpoint converts any given plain text string into its Base64 encoded representation.",
        tags: ["TOOLS", "Encoding", "Utility"],
        example: "?text=Hello%20World",
        parameters: [
            {
                name: "text",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 10000,
                },
                description: "Text to encode",
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
                const base64 = buffer_1.Buffer.from(text.trim()).toString("base64");
                return {
                    status: true,
                    data: {
                        base64: base64,
                    },
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
