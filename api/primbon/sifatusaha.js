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
async function scrapeSifatUsahaBisnis(tgl, bln, thn) {
    try {
        const response = await (0, axios_1.default)({
            url: "https://primbon.com/sifat_usaha_bisnis.php",
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            data: new URLSearchParams(Object.entries({ tgl, bln, thn, submit: " Submit! " })),
            timeout: 30000,
        });
        const $ = cheerio.load(response.data);
        const fetchText = $("#body").text();
        let hasil;
        try {
            hasil = {
                hari_lahir: fetchText.split("Hari Lahir Anda: ")[1].split(thn)[0].trim(),
                usaha: fetchText.split(thn)[1].split("< Hitung Kembali")[0].trim(),
                catatan: "Setiap manusia memiliki sifat atau karakter yang berbeda-beda dalam menjalankan bisnis atau usaha. Dengan memahami sifat bisnis kita, rekan kita, atau bahkan kompetitor kita, akan membantu kita memperbaiki diri atau untuk menjalin hubungan kerjasama yang lebih baik.",
            };
        }
        catch (e) {
            hasil = {
                status: false,
                message: "Error, Mungkin Input Yang Anda Masukkan Salah",
            };
        }
        return hasil;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/primbon/sifat_usaha_bisnis",
        name: "sifat usaha bisnis",
        category: "Primbon",
        description: "This API endpoint provides insights into an individual's business characteristics and suitability for various venture...",
        tags: ["Primbon", "Business", "Traits", "Entrepreneurship", "Career", "Fortune"],
        example: "?tgl=1&bln=1&thn=2000",
        parameters: [
            {
                name: "tgl",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 31,
                },
                description: "Day of birth (e.g., 1).",
                example: "1",
            },
            {
                name: "bln",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 12,
                },
                description: "Month of birth (e.g., 1 for January).",
                example: "1",
            },
            {
                name: "thn",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1900,
                    maximum: 2025,
                },
                description: "Year of birth (e.g., 2000).",
                example: "2000",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { tgl, bln, thn } = req.query || {};
            if (!tgl || !bln || !thn) {
                return {
                    status: false,
                    error: "Parameters 'tgl', 'bln', and 'thn' are required",
                    code: 400,
                };
            }
            const parsedTgl = parseInt(tgl);
            const parsedBln = parseInt(bln);
            const parsedThn = parseInt(thn);
            if (isNaN(parsedTgl) || isNaN(parsedBln) || isNaN(parsedThn)) {
                return {
                    status: false,
                    error: "Parameters 'tgl', 'bln', and 'thn' must be valid numbers",
                    code: 400,
                };
            }
            if (parsedTgl < 1 || parsedTgl > 31) {
                return {
                    status: false,
                    error: "Day 'tgl' must be between 1 and 31",
                    code: 400,
                };
            }
            if (parsedBln < 1 || parsedBln > 12) {
                return {
                    status: false,
                    error: "Month 'bln' must be between 1 and 12",
                    code: 400,
                };
            }
            const currentYear = new Date().getFullYear();
            if (parsedThn < 1900 || parsedThn > currentYear) {
                return {
                    status: false,
                    error: `Year 'thn' must be between 1900 and ${currentYear}`,
                    code: 400,
                };
            }
            try {
                const result = await scrapeSifatUsahaBisnis(parsedTgl.toString(), parsedBln.toString(), parsedThn.toString());
                if (!result) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
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
