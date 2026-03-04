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
import * as cheerio from 'cheerio';
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function scrape(q) {
    try {
        const response = await axios_1.default.post("https://jagokata.com/kata-bijak/cari.html", new URLSearchParams({
            citaat: q,
            zoekbutton: "Zoeken",
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 30000,
        });
        const data = response.data;
        const $ = cheerio.load(data);
        return $("#main #content #content-container #images-container ul li, #main #content #content-container #citatenrijen li")
            .map((_, el) => ({
            quote: $(el).find(".quotebody .fbquote").text().trim(),
            link: `https://jagokata.com${$(el).find("a").attr("href")}`,
            img: $(el).find(".quotebody img").attr("data-src"),
            author: $(el)
                .find(".citatenlijst-auteur > a, .auteurfbnaam")
                .text()
                .trim(),
            description: $(el)
                .find(".citatenlijst-auteur > .auteur-beschrijving")
                .text()
                .trim(),
            lifespan: $(el)
                .find(".citatenlijst-auteur > .auteur-gebsterf")
                .text()
                .trim(),
            votes: $(el).find(".votes-content > .votes-positive").text().trim(),
            category: $("#main").find("h1.kamus").text().trim(),
            tags: $(el).attr("id"),
        }))
            .get();
    }
    catch (error) {
        throw new Error("Error fetching data from JagoKata: " + error.message);
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/fun/jagokata",
        name: "jagokata",
        category: "Fun",
        description: "This API endpoint allows you to search for quotes on jagokata.com, a popular Indonesian website for quotes and sayings.",
        tags: ["Fun", "Quotes", "Motivation", "Inspiration"],
        example: "?q=kesuksesan",
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
                description: "The query to search for quotes",
                example: "kesuksesan",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { q } = req.query || {};
            if (!q) {
                return {
                    status: false,
                    error: "Query parameter is required",
                    code: 400,
                };
            }
            if (typeof q !== "string" || q.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter must be a non-empty string",
                    code: 400,
                };
            }
            if (q.length > 100) {
                return {
                    status: false,
                    error: "Query parameter must be less than 100 characters",
                    code: 400,
                };
            }
            try {
                const result = await scrape(q.trim());
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
