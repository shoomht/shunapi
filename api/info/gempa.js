var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
const urls = {
    auto: "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json",
    terkini: "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json",
    dirasakan: "https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json",
};
const BASE_SHAKEMAP_URL = "https://data.bmkg.go.id/DataMKG/TEWS/";
async function fetchAndCleanJSON(url) {
    try {
        const response = await axios_1.default.get(proxy() + url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const text = response.data;
        const cleanText = JSON.stringify(text).replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        return JSON.parse(cleanText);
    }
    catch (error) {
        throw new Error(`Error fetching or parsing JSON from ${url}: ${error.message}`);
    }
}
function addShakemapUrls(data) {
    if (!data)
        return data;
    // Helper function to add Shakemap URL to a single gempa object
    function addShakemapToGempa(gempa) {
        if (!gempa || !gempa.Shakemap)
            return gempa;
        return {
            ...gempa,
            downloadShakemap: `${BASE_SHAKEMAP_URL}${gempa.Shakemap}`
        };
    }
    // Handle different data structures
    if (data.Infogempa) {
        // For 'auto' data structure
        if (data.Infogempa.gempa) {
            return {
                ...data,
                Infogempa: {
                    ...data.Infogempa,
                    gempa: addShakemapToGempa(data.Infogempa.gempa)
                }
            };
        }
        // For 'terkini' and 'dirasakan' data structures
        else if (Array.isArray(data.Infogempa.gempa)) {
            return {
                ...data,
                Infogempa: {
                    ...data.Infogempa,
                    gempa: data.Infogempa.gempa.map(addShakemapToGempa)
                }
            };
        }
    }
    return data;
}
async function scrapeBMKG() {
    try {
        const responses = await Promise.all(Object.values(urls).map((url) => fetchAndCleanJSON(url)));
        const processedResponses = responses.map(response => addShakemapUrls(response));
        const combinedData = {
            auto: processedResponses[0],
            terkini: processedResponses[1],
            dirasakan: processedResponses[2],
        };
        return combinedData;
    }
    catch (error) {
        console.error("Error during BMKG scraping:", error.message);
        throw error;
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/info/bmkg",
        name: "bmkg gempa",
        category: "Info",
        description: "This API endpoint provides the latest earthquake information from BMKG (Badan Meteorologi, Klimatologi, dan Geofisika...",
        tags: ["Info", "BMKG", "Earthquake"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrapeBMKG();
                return {
                    status: true,
                    data: data,
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
