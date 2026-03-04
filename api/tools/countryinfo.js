var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
function calculateSimilarity(str1, str2) {
    str1 = str1.toLowerCase().replace(/\s+/g, "");
    str2 = str2.toLowerCase().replace(/\s+/g, "");
    if (str1 === str2)
        return 1;
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    if (str2.includes(str1))
        return 0.9;
    if (str1.includes(str2))
        return 0.9;
    let matches = 0;
    for (let i = 0; i < Math.min(len1, len2); i++) {
        if (str1[i] === str2[i])
            matches++;
    }
    const prefixMatch = str1.startsWith(str2.slice(0, 3)) || str2.startsWith(str1.slice(0, 3))
        ? 0.2
        : 0;
    return matches / maxLen + prefixMatch;
}
async function scrapeCountryInfo(name) {
    try {
        const [coordsResponse, countriesResponse] = await Promise.all([
            axios_1.default.get("https://raw.githubusercontent.com/CoderPopCat/Country-Searcher/refs/heads/master/src/constants/country-coords.json", { timeout: 30000 }),
            axios_1.default.get("https://raw.githubusercontent.com/CoderPopCat/Country-Searcher/refs/heads/master/src/constants/countries.json", { timeout: 30000 }),
        ]);
        const countriesCoords = coordsResponse.data;
        const countriesInfo = countriesResponse.data;
        const searchName = name.toLowerCase().trim();
        const similarityResults = countriesInfo
            .map((country) => ({
            country,
            similarity: calculateSimilarity(searchName, country.country),
        }))
            .sort((a, b) => b.similarity - a.similarity);
        const bestMatch = similarityResults[0];
        if (bestMatch.similarity < 0.4) {
            const suggestions = similarityResults.slice(0, 5).map((r) => ({
                country: r.country.country,
                similarity: r.similarity,
            }));
            throw { status: 404, error: "Country not found", suggestions };
        }
        const countryInfo = bestMatch.country;
        const countryCoord = countriesCoords.find((c) => c.name.toLowerCase() === countryInfo.country.toLowerCase());
        const continents = {
            as: { name: "Asia", emoji: "🌏" },
            eu: { name: "Europe", emoji: "🌍" },
            af: { name: "Africa", emoji: "🌍" },
            na: { name: "North America", emoji: "🌎" },
            sa: { name: "South America", emoji: "🌎" },
            oc: { name: "Oceania", emoji: "🌏" },
            an: { name: "Antarctica", emoji: "🌎" },
        };
        const neighbors = countryInfo.neighbors
            .map((neighborCode) => {
            const neighborCountry = countriesCoords.find((c) => c.country.toLowerCase() === neighborCode.toLowerCase());
            return neighborCountry
                ? {
                    name: neighborCountry.name,
                    flag: neighborCountry.icon,
                    coordinates: {
                        latitude: neighborCountry.latitude,
                        longitude: neighborCountry.longitude,
                    },
                }
                : null;
        })
            .filter((n) => n !== null);
        return {
            status: true,
            searchMetadata: {
                originalQuery: name,
                matchedCountry: countryInfo.country,
                similarity: bestMatch.similarity,
            },
            data: {
                name: countryInfo.country,
                capital: countryInfo.capital,
                flag: countryInfo.flag,
                phoneCode: countryInfo.phone_code,
                googleMapsLink: `https://www.google.com/maps/place/$$${countryInfo.country}/@${countryCoord?.latitude || 0},${countryCoord?.longitude || 0},6z`,
                continent: {
                    code: countryInfo.continent,
                    name: continents[countryInfo.continent]?.name || "Unknown",
                    emoji: continents[countryInfo.continent]?.emoji || "🌐",
                },
                coordinates: {
                    latitude: countryCoord?.latitude || null,
                    longitude: countryCoord?.longitude || null,
                },
                area: {
                    squareKilometers: countryInfo.area.km2,
                    squareMiles: countryInfo.area.mi2,
                },
                landlocked: countryInfo.is_landlocked,
                languages: {
                    native: countryInfo.native_language,
                    codes: countryInfo.language_codes,
                },
                famousFor: countryInfo.famous_for,
                constitutionalForm: countryInfo.constitutional_form,
                neighbors: neighbors,
                currency: countryInfo.currency,
                drivingSide: countryInfo.drive_direction,
                alcoholProhibition: countryInfo.alcohol_prohibition,
                internetTLD: countryInfo.tld,
                isoCode: {
                    numeric: countryInfo.iso.numeric,
                    alpha2: countryInfo.iso.alpha_2,
                    alpha3: countryInfo.iso.alpha_3,
                },
            },
        };
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            throw {
                status: error.response?.status || 500,
                error: error.response?.data?.message || error.message,
            };
        }
        throw error;
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/countryInfo",
        name: "country Info",
        category: "Tools",
        description: "This API endpoint provides detailed information about a country based on its name.",
        tags: ["TOOLS", "COUNTRY", "GEOGRAPHY", "INFORMATION"],
        example: "?name=Indonesia",
        parameters: [
            {
                name: "name",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "The name of the country to search for",
                example: "Indonesia",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { name } = req.query || {};
            if (!name) {
                return {
                    status: false,
                    error: "Name parameter is required",
                    code: 400,
                };
            }
            if (typeof name !== "string" || name.trim().length === 0) {
                return {
                    status: false,
                    error: "Name parameter must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrapeCountryInfo(name.trim());
                return {
                    status: true,
                    data: result.data,
                    searchMetadata: result.searchMetadata,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                const statusCode = error.status || 500;
                return {
                    status: false,
                    error: error.error || "Internal Server Error",
                    code: statusCode,
                    ...(error.suggestions && { suggestions: error.suggestions }),
                };
            }
        },
    }
];
