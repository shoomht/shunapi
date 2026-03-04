var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function searchSubdomains(domain) {
    const url = `https://crt.sh/?q=${domain}&output=json`;
    try {
        const response = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = response.data;
        const subdomains = data.map((entry) => entry.name_value);
        const uniqueSubdomains = [...new Set(subdomains)];
        uniqueSubdomains.sort();
        return uniqueSubdomains;
    }
    catch (error) {
        console.error("Error fetching subdomains:", error.message);
        throw new Error("Failed to retrieve subdomains from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/subdomains",
        name: "subdomain finder",
        category: "Tools",
        description: "This API endpoint helps you discover subdomains associated with a given root domain.",
        tags: ["TOOLS", "Subdomain", "Security"],
        example: "?domain=siputzx.my.id",
        parameters: [
            {
                name: "domain",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 3,
                    maxLength: 253,
                },
                description: "Domain to search",
                example: "siputzx.my.id",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { domain } = req.query || {};
            if (!domain) {
                return {
                    status: false,
                    error: "Domain is required",
                    code: 400,
                };
            }
            if (typeof domain !== "string" || domain.trim().length === 0) {
                return {
                    status: false,
                    error: "Domain must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await searchSubdomains(domain.trim());
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
