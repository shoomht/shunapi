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
async function scrapeRamalanJodoh(nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2) {
    try {
        const response = await (0, axios_1.default)({
            method: "post",
            url: "https://www.primbon.com/ramalan_jodoh.php",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
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
                submit: "  RAMALAN JODOH >>  ",
            }),
            timeout: 10000,
        });
        const $ = cheerio.load(response.data);
        const extractPerson = (index) => {
            const elements = $("#body")
                .contents()
                .filter((_, el) => {
                return el.type === "tag" && (el.name === "b" || el.name === "i");
            });
            const nameIndex = index * 2;
            const birthIndex = nameIndex + 1;
            return {
                nama: elements.eq(nameIndex).text().trim(),
                tanggal_lahir: elements.eq(birthIndex).text().replace("Tgl. Lahir:", "").trim(),
            };
        };
        const person1 = extractPerson(0);
        const person2 = extractPerson(1);
        const cleanPredictions = () => {
            let text = $("#body").text();
            text = text.replace(/\(adsbygoogle.*\);/g, "");
            text = text.replace("RAMALAN JODOH", "");
            text = text.replace(/Konsultasi Hari Baik Akad Nikah >>>/g, "");
            const predictionsStart = text.indexOf("1. Berdasarkan neptu");
            const predictionsEnd = text.indexOf("*Jangan mudah memutuskan");
            if (predictionsStart !== -1 && predictionsEnd !== -1) {
                text = text.substring(predictionsStart, predictionsEnd).trim();
            }
            const predictions = text
                .split(/\d+\.\s+/)
                .filter((item) => item.trim())
                .map((item) => item.trim());
            return predictions;
        };
        const predictions = cleanPredictions();
        const peringatanElement = $("#body i")
            .filter((_, el) => $(el).text().includes("Jangan mudah memutuskan"))
            .first();
        const peringatan = peringatanElement.length
            ? peringatanElement.text().split("Konsultasi")[0].trim()
            : "No specific warning found.";
        const result = {
            orang_pertama: person1,
            orang_kedua: person2,
            deskripsi: "Dibawah ini adalah hasil ramalan primbon perjodohan bagi kedua pasangan yang dihitung berdasarkan 6 petung perjodohan dari kitab primbon Betaljemur Adammakna yang disusun oleh Kangjeng Pangeran Harya Tjakraningrat. Hasil ramalan bisa saja saling bertentangan pada setiap petung. Hasil ramalan yang positif (baik) dapat mengurangi pengaruh ramalan yang negatif (buruk), begitu pula sebaliknya.",
            hasil_ramalan: predictions,
        };
        return { result, peringatan };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/primbon/ramalanjodoh",
        name: "ramalan jodoh",
        category: "Primbon",
        description: "This API endpoint offers a Javanese Primbon-based marriage compatibility prediction.",
        tags: ["Primbon", "Jawa", "Jodoh", "Compatibility", "Marriage", "Culture", "Relationship"],
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
                const { result, peringatan } = await scrapeRamalanJodoh(nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2);
                if (!result) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: {
                        result,
                        peringatan,
                    },
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
