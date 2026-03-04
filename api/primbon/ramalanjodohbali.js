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
async function scrapeRamalanJodohBali(nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2) {
    try {
        const response = await (0, axios_1.default)({
            url: "https://www.primbon.com/ramalan_jodoh_bali.php",
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            data: new URLSearchParams({
                nama1,
                tgl1,
                bln1,
                thn1,
                nama2,
                tgl2,
                bln2,
                thn2,
                submit: " Submit! ",
            }),
            timeout: 30000,
        });
        const $ = cheerio.load(response.data);
        const fetchText = $("#body").text();
        let hasil;
        try {
            hasil = {
                nama_anda: {
                    nama: nama1,
                    tgl_lahir: fetchText.split("Hari Lahir: ")[1].split("Nama")[0].trim(),
                },
                nama_pasangan: {
                    nama: nama2,
                    tgl_lahir: fetchText.split(nama2 + "Hari Lahir: ")[1].split("HASILNYA MENURUT PAL SRI SEDANAI")[0].trim(),
                },
                result: fetchText.split("HASILNYA MENURUT PAL SRI SEDANAI. ")[1].split("Konsultasi Hari Baik Akad Nikah >>>")[0].trim(),
                catatan: "Untuk melihat kecocokan jodoh dengan pasangan, dapat dikombinasikan dengan Ramalan Jodoh (Jawa), numerologi Kecocokan Cinta, tingkat keserasian Nama Pasangan, Ramalan Perjalanan Hidup Suami Istri, dan makna dari Tanggal Jadian/Pernikahan.",
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
        endpoint: "/api/primbon/ramalanjodohbali",
        name: "ramalan jodoh bali",
        category: "Primbon",
        description: "This API endpoint offers a Balinese Primbon-based marriage compatibility prediction.",
        tags: ["Primbon", "Bali", "Jodoh", "Compatibility", "Marriage", "Culture", "Relationship"],
        example: "?nama1=putu&tgl1=16&bln1=11&thn1=2007&nama2=keyla&tgl2=1&bln2=1&thn2=2008",
        parameters: [
            {
                name: "nama1",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "Name of the first person.",
                example: "putu",
            },
            {
                name: "tgl1",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 31,
                },
                description: "Birth day of the first person (e.g., 16).",
                example: "16",
            },
            {
                name: "bln1",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 12,
                },
                description: "Birth month of the first person (e.g., 11 for November).",
                example: "11",
            },
            {
                name: "thn1",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1900,
                    maximum: new Date().getFullYear(),
                },
                description: "Birth year of the first person (e.g., 2007).",
                example: "2007",
            },
            {
                name: "nama2",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "Name of the second person.",
                example: "keyla",
            },
            {
                name: "tgl2",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 31,
                },
                description: "Birth day of the second person (e.g., 1).",
                example: "1",
            },
            {
                name: "bln2",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 12,
                },
                description: "Birth month of the second person (e.g., 1 for January).",
                example: "1",
            },
            {
                name: "thn2",
                in: "query",
                required: true,
                schema: {
                    type: "integer",
                    minimum: 1900,
                    maximum: new Date().getFullYear(),
                },
                description: "Birth year of the second person (e.g., 2008).",
                example: "2008",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2 } = req.query || {};
            const fields = { nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2 };
            const fieldNames = {
                nama1: "Name of the first person",
                tgl1: "Birth day of the first person",
                bln1: "Birth month of the first person",
                thn1: "Birth year of the first person",
                nama2: "Name of the second person",
                tgl2: "Birth day of the second person",
                bln2: "Birth month of the second person",
                thn2: "Birth year of the second person",
            };
            for (const key in fields) {
                const value = fields[key];
                if (!value || (typeof value === "string" && value.trim().length === 0)) {
                    return {
                        status: false,
                        error: `${fieldNames[key]} is required.`,
                        code: 400,
                    };
                }
                if (key.startsWith("tgl") || key.startsWith("bln") || key.startsWith("thn")) {
                    const numValue = parseInt(value);
                    if (isNaN(numValue)) {
                        return {
                            status: false,
                            error: `${fieldNames[key]} must be a valid number.`,
                            code: 400,
                        };
                    }
                    if (key.startsWith("tgl") && (numValue < 1 || numValue > 31)) {
                        return {
                            status: false,
                            error: `${fieldNames[key]} must be between 1 and 31.`,
                            code: 400,
                        };
                    }
                    if (key.startsWith("bln") && (numValue < 1 || numValue > 12)) {
                        return {
                            status: false,
                            error: `${fieldNames[key]} must be between 1 and 12.`,
                            code: 400,
                        };
                    }
                    const currentYear = new Date().getFullYear();
                    if (key.startsWith("thn") && (numValue < 1900 || numValue > currentYear)) {
                        return {
                            status: false,
                            error: `${fieldNames[key]} must be between 1900 and ${currentYear}.`,
                            code: 400,
                        };
                    }
                }
            }
            try {
                const result = await scrapeRamalanJodohBali(nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2);
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
