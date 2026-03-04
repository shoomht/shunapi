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
async function PlayStore(search) {
    try {
        const { data } = await axios_1.default.get(`https://play.google.com/store/search?q=${search}&c=apps`, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const hasil = [];
        const $ = cheerio.load(data);
        $(".ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a").each((i, u) => {
            const linkk = $(u).attr("href");
            const nama = $(u).find(".j2FCNc > .cXFu1 > .ubGTjb > .DdYX5").text();
            const developer = $(u)
                .find(".j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb")
                .text();
            let img = $(u).find(".j2FCNc > img").attr("src");
            if (img && img.includes("=s64")) {
                img = img.replace("=s64", "=w480-h960-rw");
            }
            const rate = $(u)
                .find(".j2FCNc > .cXFu1 > .ubGTjb > div")
                .attr("aria-label");
            const rate2 = $(u)
                .find(".j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF")
                .text();
            const link = `https://play.google.com${linkk}`;
            hasil.push({
                link: link,
                nama: nama ? nama : "No name",
                developer: developer ? developer : "No Developer",
                img: img ? img : "https://i.ibb.co/G7CrCwN/404.png",
                rate: rate ? rate : "No Rate",
                rate2: rate2 ? rate2 : "No Rate",
                link_dev: `https://play.google.com/store/apps/developer?id=${developer.split(" ").join("+")}`,
            });
        });
        if (hasil.every((x) => x === undefined))
            throw new Error("No result found!");
        return hasil;
    }
    catch (err) {
        throw err;
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/apk/playstore",
        name: "playstore",
        category: "APK",
        description: "This API endpoint allows you to search for Android applications on the Google Play Store.",
        tags: ["APK", "Search", "Google Play", "Android", "Apps"],
        example: "?query=free fire",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "Search query for applications",
                example: "free fire",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query } = req.query || {};
            if (!query) {
                return {
                    status: false,
                    error: "Query parameter is required",
                    code: 400,
                };
            }
            if (typeof query !== "string" || query.trim().length === 0) {
                return {
                    status: false,
                    error: "Query must be a non-empty string",
                    code: 400,
                };
            }
            if (query.length > 255) {
                return {
                    status: false,
                    error: "Query must be less than 255 characters",
                    code: 400,
                };
            }
            try {
                const result = await PlayStore(query.trim());
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
