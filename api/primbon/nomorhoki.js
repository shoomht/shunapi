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
async function scrapeNomorHoki(phoneNumber) {
    try {
        const response = await axios_1.default.post("https://www.primbon.com/no_hoki_bagua_shuzi.php", `nomer=${phoneNumber}&submit=+Submit%21+`, {
            headers: {
                authority: "www.primbon.com",
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "content-type": "application/x-www-form-urlencoded",
                origin: "https://www.primbon.com",
                referer: "https://www.primbon.com/no_hoki_bagua_shuzi.php",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
            },
            timeout: 10000,
        });
        const $ = cheerio.load(response.data);
        const extractNumber = (text) => {
            const matches = text.match(/\d+(\.\d+)?/);
            return matches ? parseFloat(matches[0]) : 0;
        };
        const extractContent = (selector, type = "text") => {
            try {
                const element = $(selector);
                if (!element.length)
                    return null;
                return type === "text" ? element.text().trim() : element;
            }
            catch (error) {
                return null;
            }
        };
        const nomorHPElement = extractContent("b:contains(\"No. HP\")");
        const nomorHP = nomorHPElement ? nomorHPElement.replace("No. HP : ", "") : null;
        const baguaShuziText = extractContent("b:contains(\"% Angka Bagua Shuzi\")");
        if (!nomorHP || !baguaShuziText) {
            throw new Error("Failed to extract basic information from response");
        }
        const result = {
            status: true,
            message: "Success",
            data: {
                nomor: nomorHP,
                angka_bagua_shuzi: {
                    value: extractNumber(baguaShuziText),
                    description: "Persentase Angka Bagua Shuzi menunjukkan tingkat kecocokan nomor dengan elemen karakter.",
                },
                energi_positif: {
                    total: extractNumber($("b:contains(\"%\")").first().text()),
                    details: {
                        kekayaan: extractNumber($("td:contains(\"Kekayaan =\")").text()),
                        kesehatan: extractNumber($("td:contains(\"Kesehatan =\")").text()),
                        cinta: extractNumber($("td:contains(\"Cinta/Relasi =\")").text()),
                        kestabilan: extractNumber($("td:contains(\"Kestabilan =\")").text()),
                    },
                    description: "Energi positif mempengaruhi aspek kekayaan, kesehatan, cinta/relasi, dan kestabilan dalam hidup.",
                },
                energi_negatif: {
                    total: extractNumber($("b:contains(\"%\")").last().text()),
                    details: {
                        perselisihan: extractNumber($("td:contains(\"Perselisihan =\")").text()),
                        kehilangan: extractNumber($("td:contains(\"Kehilangan =\")").text()),
                        malapetaka: extractNumber($("td:contains(\"Malapetaka =\")").text()),
                        kehancuran: extractNumber($("td:contains(\"Kehancuran =\")").text()),
                    },
                    description: "Energi negatif menunjukkan potensi hambatan dalam aspek perselisihan, kehilangan, malapetaka, dan kehancuran.",
                },
            },
        };
        const energiPositif = result.data.energi_positif.total;
        const baguaShuzi = result.data.angka_bagua_shuzi.value;
        result.data.analisis = {
            status: energiPositif > 60 && baguaShuzi >= 60,
            description: "Nomor dianggap hoki jika persentase Energi Positif di atas 60% dan persentase Angka Bagua Shuzi minimal 60%",
        };
        if (!result.data.nomor || isNaN(result.data.angka_bagua_shuzi.value)) {
            throw new Error("Invalid data extracted from response");
        }
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
        endpoint: "/api/primbon/nomorhoki",
        name: "nomor hoki",
        category: "Primbon",
        description: "This API endpoint determines the 'lucky' status of a given phone number based on Primbon's Bagua Shuzi and energy cal...",
        tags: ["Primbon", "Lucky Number", "Numerology", "Phone Number", "Bagua Shuzi"],
        example: "?phoneNumber=6285658939117",
        parameters: [
            {
                name: "phoneNumber",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    pattern: "^\\d+$",
                    minLength: 8,
                    maxLength: 15,
                },
                description: "The phone number to check (numbers only, e.g., '6281234567890').",
                example: "6285658939117",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { phoneNumber } = req.query || {};
            if (!phoneNumber) {
                return {
                    status: false,
                    error: "Phone number is required",
                    code: 400,
                };
            }
            if (typeof phoneNumber !== "string" || !/^\d+$/.test(phoneNumber.trim())) {
                return {
                    status: false,
                    error: "Invalid phone number format. Use numbers only",
                    code: 400,
                };
            }
            if (phoneNumber.trim().length < 8 || phoneNumber.trim().length > 15) {
                return {
                    status: false,
                    error: "Phone number must be between 8 and 15 digits",
                    code: 400,
                };
            }
            try {
                const result = await scrapeNomorHoki(phoneNumber.trim());
                return {
                    status: true,
                    data: result.data,
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
