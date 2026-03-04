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
async function scrapeKodepos(form) {
    try {
        const response = await axios_1.default.post("https://kodepos.posindonesia.co.id/CariKodepos", new URLSearchParams({ kodepos: form }).toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Cache-Control": "max-age=0",
                "Origin": "https://kodepos.posindonesia.co.id",
                "Referer": "https://kodepos.posindonesia.co.id/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
                "Cookie": "ci_session=aqlrvi6tdfajmfelsla8n974p1btd9pb",
            },
            timeout: 30000,
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const result = $("tbody > tr")
            .map((_, el) => {
            const $td = $(el).find("td");
            const kodepos = $td.eq(1).text().trim();
            const desa = $td.eq(2).text().trim();
            const kecamatan = $td.eq(3).text().trim();
            const kota = $td.eq(4).text().trim();
            const provinsi = $td.eq(5).text().trim();
            return {
                kodepos,
                desa,
                kecamatan,
                kota,
                provinsi,
            };
        })
            .get();
        return result;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/kodepos",
        name: "kodepos",
        category: "Tools",
        description: "This API endpoint allows you to search for postal code information based on a given location name, such as a village ...",
        tags: ["Tools", "Location", "Postal Code"],
        example: "?form=pasiran jaya",
        parameters: [
            {
                name: "form",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "Location name",
                example: "pasiran jaya",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { form } = req.query || {};
            if (!form) {
                return {
                    status: false,
                    error: "Form parameter is required",
                    code: 400,
                };
            }
            if (typeof form !== "string" || form.trim().length === 0) {
                return {
                    status: false,
                    error: "Form parameter must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrapeKodepos(form.trim());
                if (!result || result.length === 0) {
                    return {
                        status: false,
                        error: "No postal code information found for the given location",
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
