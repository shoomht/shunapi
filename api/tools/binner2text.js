async function scrape(content) {
    const binary2text = (binary) => {
        return binary
            .split(" ")
            .map((bin) => String.fromCharCode(parseInt(bin, 2)))
            .join("");
    };
    return binary2text(content);
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/binary2text",
        name: "binary2text",
        category: "Tools",
        description: "This API endpoint converts a binary code string into human-readable text.",
        tags: ["TOOLS", "ENCODING", "DECODING", "BINARY"],
        example: "?content=01001000 01100101 01101100 01101100 01101111",
        parameters: [
            {
                name: "content",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 5000,
                },
                description: "The binary string to convert to text (e.g., \"01001000 01100101\")",
                example: "01001000 01100101 01101100 01101100 01101111",
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
                const result = await scrape(content.trim());
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
