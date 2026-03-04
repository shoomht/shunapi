var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
class WilayahService {
    baseUrl;
    bmkgUrl;
    constructor() {
        this.baseUrl =
            "https://raw.githubusercontent.com/kodewilayah/permendagri-72-2019/main/dist/base.csv";
        this.bmkgUrl = "https://api.bmkg.go.id/publik/prakiraan-cuaca";
    }
    determineBMKGUrl(code) {
        const dots = (code.match(/\./g) || []).length;
        const admLevel = dots + 1;
        return `${this.bmkgUrl}?adm${admLevel}=${code}`;
    }
    parseWilayahCode(code) {
        const parts = code.split(".");
        const levels = {
            adm1: parts[0],
            adm2: parts.length >= 2 ? parts.slice(0, 2).join(".") : null,
            adm3: parts.length >= 3 ? parts.slice(0, 3).join(".") : null,
            adm4: parts.length >= 4 ? parts.slice(0, 4).join(".") : null,
        };
        const highestLevel = Object.entries(levels)
            .reverse()
            .find(([_key, value]) => value !== null);
        return {
            ...levels,
            currentLevel: highestLevel ? highestLevel[0] : "adm1",
            bmkgUrl: this.determineBMKGUrl(code),
        };
    }
    calculateSimilarity(searchQuery, targetText) {
        const query = searchQuery.toLowerCase();
        const target = targetText.toLowerCase();
        const queryWords = query.split(" ").filter((w) => w.length > 0);
        const targetWords = target.split(" ").filter((w) => w.length > 0);
        let wordMatchScore = 0;
        let exactMatchBonus = 0;
        for (const queryWord of queryWords) {
            let bestWordScore = 0;
            for (const targetWord of targetWords) {
                if (queryWord === targetWord) {
                    bestWordScore = 1;
                    exactMatchBonus += 0.2;
                    break;
                }
                if (targetWord.includes(queryWord) || queryWord.includes(targetWord)) {
                    const matchLength = Math.min(queryWord.length, targetWord.length);
                    const maxLength = Math.max(queryWord.length, targetWord.length);
                    const partialScore = matchLength / maxLength;
                    bestWordScore = Math.max(bestWordScore, partialScore);
                }
            }
            wordMatchScore += bestWordScore;
        }
        const normalizedWordScore = wordMatchScore / queryWords.length;
        return normalizedWordScore + exactMatchBonus;
    }
    async searchWilayah(query) {
        try {
            const response = await axios_1.default.get(this.baseUrl);
            const data = response.data;
            const rows = data.split("\n");
            const results = [];
            for (const row of rows) {
                if (!row.trim())
                    continue;
                const [kode, nama] = row.split(",");
                if (!nama)
                    continue;
                const similarity = this.calculateSimilarity(query, nama);
                const threshold = query.length <= 4 ? 0.4 : 0.3;
                if (similarity > threshold) {
                    const wilayahInfo = this.parseWilayahCode(kode);
                    results.push({
                        kode,
                        nama,
                        score: similarity,
                        ...wilayahInfo,
                    });
                }
            }
            results.sort((a, b) => b.score - a.score);
            return results.slice(0, 10);
        }
        catch (error) {
            console.error("Error dalam pencarian wilayah:", error.message);
            throw new Error("Failed to search wilayah data");
        }
    }
    async getWeatherData(wilayahCode) {
        try {
            const url = this.determineBMKGUrl(wilayahCode);
            const response = await axios_1.default.get(url, { timeout: 30000 });
            return response.data.data;
        }
        catch (error) {
            console.error("Error dalam mengambil data cuaca:", error.message);
            throw new Error("Failed to get weather data from API");
        }
    }
    async scrape(query) {
        try {
            const wilayahResults = await this.searchWilayah(query);
            if (wilayahResults.length > 0) {
                const topResult = wilayahResults[0];
                const weatherData = await this.getWeatherData(topResult.kode);
                return {
                    wilayah: topResult,
                    weather: weatherData,
                };
            }
            return null;
        }
        catch (error) {
            console.error("Error dalam pencarian wilayah dan cuaca:", error.message);
            throw new Error("Failed to get weather and location data");
        }
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/info/cuaca",
        name: "cuaca",
        category: "Info",
        description: "This API endpoint provides weather information based on a location query.",
        tags: ["INFO", "WEATHER", "LOCATION"],
        example: "?q=pasiran jaya",
        parameters: [
            {
                name: "q",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "Location query",
                example: "pasiran jaya",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { q } = req.query || {};
            if (typeof q !== "string" || q.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'q' must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await new WilayahService().scrape(q.trim());
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
