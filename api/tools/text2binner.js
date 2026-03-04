function text2binary(text) {
    return text
        .split("")
        .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
        .join(" ");
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/text2binary",
        name: "text2binary",
        category: "Tools",
        description: "This API endpoint converts any given plain text string into its binary representation.",
        tags: ["TOOLS", "Binary", "Encoding"],
        example: "?content=Hello",
        parameters: [
            {
                name: "content",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
                description: "Text content",
                example: "Hello",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { content } = req.query || {};
            if (!content) {
                return {
                    status: false,
                    error: "Parameter 'content' is required.",
                    code: 400,
                };
            }
            if (typeof content !== "string" || content.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'content' must be a non-empty string.",
                    code: 400,
                };
            }
            try {
                const binaryResult = text2binary(content.trim());
                return {
                    status: true,
                    data: binaryResult,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                return {
                    status: false,
                    error: error.message || "An internal server error occurred.",
                    code: 500,
                };
            }
        },
    }
];
