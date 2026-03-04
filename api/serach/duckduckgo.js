var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import * as cheerio from 'cheerio';
import tough_cookie_1 from 'tough-cookie';
import axios_cookiejar_support_1 from 'axios-cookiejar-support';
const jar = new tough_cookie_1.CookieJar();
const client = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar }));
class DuckDuckGoScraper {
    baseURL;
    headers;
    constructor() {
        this.baseURL = "https:/html.duckduckgo.com/html/";
        this.headers = {
            "authority": "html.duckduckgo.com",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "origin": "https://html.duckduckgo.com",
            "referer": "https://html.duckduckgo.com/",
            "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        };
    }
    async search(query, options = {}) {
        const { kl = "", df = "" } = options;
        if (!query || query.trim() === "") {
            throw new Error("Query parameter is required and cannot be empty");
        }
        try {
            const searchData = this.buildSearchData(query, kl, df);
            const response = await client.post('https://simpel-cors-proxy.vercel.app/' + this.baseURL, searchData, {
                headers: this.headers,
            });
            const pageResults = this.parseResults(response.data);
            return {
                query: query,
                results: pageResults.results,
                hasNextPage: pageResults.hasNextPage,
                totalResults: pageResults.results.length,
            };
        }
        catch (error) {
            throw new Error(`Scraping failed: ${error.message}`);
        }
    }
    buildSearchData(query, kl, df) {
        const data = new URLSearchParams();
        data.append("q", query);
        data.append("b", "");
        if (kl)
            data.append("kl", kl);
        if (df)
            data.append("df", df);
        return data.toString();
    }
    parseResults(html) {
        const $ = cheerio.load(html);
        const results = [];
        let hasNextPage = false;
        $(".result.results_links.results_links_deep.web-result").each((index, element) => {
            const $result = $(element);
            const title = $result.find(".result__title a").text().trim();
            const url = $result.find(".result__title a").attr("href");
            const snippet = $result.find(".result__snippet").text().trim();
            const displayUrl = $result.find(".result__url").text().trim();
            const favicon = $result.find(".result__icon__img").attr("src");
            if (title && url) {
                results.push({
                    title: title,
                    url: url,
                    snippet: snippet,
                    displayUrl: displayUrl,
                    favicon: favicon ? `https:${favicon}` : null,
                });
            }
        });
        hasNextPage = $(".nav-link form input[value=\"Next\"]").length > 0;
        return {
            results: results,
            hasNextPage: hasNextPage,
        };
    }
    extractNextPageData(html) {
        const $ = cheerio.load(html);
        const vqd = $(".nav-link form input[name=\"vqd\"]").attr("value") || "";
        const nextParams = $(".nav-link form input[name=\"nextParams\"]").attr("value") || "";
        return { vqd, nextParams };
    }
    getRegions() {
        return {
            "": "All Regions",
            "ar-es": "Argentina",
            "au-en": "Australia",
            "at-de": "Austria",
            "be-fr": "Belgium (fr)",
            "be-nl": "Belgium (nl)",
            "br-pt": "Brazil",
            "bg-bg": "Bulgaria",
            "ca-en": "Canada (en)",
            "ca-fr": "Canada (fr)",
            "ct-ca": "Catalonia",
            "cl-es": "Chile",
            "cn-zh": "China",
            "co-es": "Colombia",
            "hr-hr": "Croatia",
            "cz-cs": "Czech Republic",
            "dk-da": "Denmark",
            "ee-et": "Estonia",
            "fi-fi": "Finland",
            "fr-fr": "France",
            "de-de": "Germany",
            "gr-el": "Greece",
            "hk-tzh": "Hong Kong",
            "hu-hu": "Hungary",
            "is-is": "Iceland",
            "in-en": "India (en)",
            "id-en": "Indonesia (en)",
            "ie-en": "Ireland",
            "il-en": "Israel (en)",
            "it-it": "Italy",
            "jp-jp": "Japan",
            "kr-kr": "Korea",
            "lv-lv": "Latvia",
            "lt-lt": "Lithuania",
            "my-en": "Malaysia (en)",
            "mx-es": "Mexico",
            "nl-nl": "Netherlands",
            "nz-en": "New Zealand",
            "no-no": "Norway",
            "pk-en": "Pakistan (en)",
            "pe-es": "Peru",
            "ph-en": "Philippines (en)",
            "pl-pl": "Poland",
            "pt-pt": "Portugal",
            "ro-ro": "Romania",
            "ru-ru": "Russia",
            "xa-ar": "Saudi Arabia",
            "sg-en": "Singapore",
            "sk-sk": "Slovakia",
            "sl-sl": "Slovenia",
            "za-en": "South Africa",
            "es-ca": "Spain (ca)",
            "es-es": "Spain (es)",
            "se-sv": "Sweden",
            "ch-de": "Switzerland (de)",
            "ch-fr": "Switzerland (fr)",
            "tw-tzh": "Taiwan",
            "th-en": "Thailand (en)",
            "tr-tr": "Turkey",
            "us-en": "US (English)",
            "us-es": "US (Spanish)",
            "ua-uk": "Ukraine",
            "uk-en": "United Kingdom",
            "vn-en": "Vietnam (en)",
        };
    }
    getTimeFilters() {
        return {
            "": "Any Time",
            "d": "Past Day",
            "w": "Past Week",
            "m": "Past Month",
            "y": "Past Year",
        };
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/s/duckduckgo",
        name: "duckduckgo",
        category: "Search",
        description: "This API endpoint allows you to perform web searches using DuckDuckGo.",
        tags: ["Search", "Web", "DuckDuckGo"],
        example: "?query=openai&kl=us-en&df=w",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
                description: "The search query string",
                example: "openai",
            },
            {
                name: "kl",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    minLength: 2,
                    maxLength: 10,
                },
                description: "Country/region code (e.g., 'au-en', 'id-en')",
                example: "us-en",
            },
            {
                name: "df",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    enum: ["d", "w", "m", "y"],
                },
                description: "Time filter ('d'=day, 'w'=week, 'm'=month, 'y'=year)",
                example: "w",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query, kl, df } = req.query || {};
            if (typeof query !== "string" || query.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter is required and cannot be empty",
                    code: 400,
                };
            }
            const scraper = new DuckDuckGoScraper();
            const availableRegions = scraper.getRegions();
            const options = {};
            if (typeof kl === "string" && kl.trim().length > 0) {
                if (!Object.keys(availableRegions).includes(kl)) {
                    return {
                        status: false,
                        error: `Invalid 'kl' parameter. Supported regions are: ${Object.keys(availableRegions).join(", ")}`,
                        code: 400,
                    };
                }
                options.kl = kl.trim();
            }
            if (typeof df === "string" && ["d", "w", "m", "y"].includes(df)) {
                options.df = df;
            }
            try {
                const result = await scraper.search(query.trim(), options);
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
