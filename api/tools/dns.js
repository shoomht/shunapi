var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function scrape(domain, dnsServer) {
    try {
        const response = await axios_1.default.post("https://www.nslookup.io/api/v1/records", {
            domain: domain,
            dnsServer: dnsServer,
        }, {
            headers: {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            timeout: 30000,
        });
        return response.data.result || response.data;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/dns",
        name: "dns",
        category: "Tools",
        description: "This API endpoint allows you to retrieve DNS records for a specified domain.",
        tags: ["Tools", "Network", "DNS"],
        example: "?domain=google.com&dnsServer=cloudflare",
        parameters: [
            {
                name: "domain",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "Domain name",
                example: "google.com",
            },
            {
                name: "dnsServer",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                    default: "cloudflare",
                },
                description: "DNS server",
                example: "cloudflare",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { domain, dnsServer } = req.query || {};
            if (!domain) {
                return {
                    status: false,
                    error: "Parameter 'domain' is required",
                    code: 400,
                };
            }
            if (typeof domain !== "string" || domain.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'domain' must be a non-empty string",
                    code: 400,
                };
            }
            if (dnsServer && typeof dnsServer !== "string") {
                return {
                    status: false,
                    error: "Parameter 'dnsServer' must be a string",
                    code: 400,
                };
            }
            try {
                const result = await scrape(domain.trim(), (dnsServer || "cloudflare").trim());
                if (!result) {
                    return {
                        status: false,
                        error: "No DNS records found for the specified domain",
                        code: 404,
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
