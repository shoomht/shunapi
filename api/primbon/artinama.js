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
async function scrape(nama) {
    try {
        const response = await axios_1.default.get(`https://primbon.com/arti_nama.php?nama1=${nama}&proses=+Submit%21+`, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(response.data);
        const fetchText = $("#body").text();
        let hasil;
        try {
            hasil = {
                nama,
                arti: fetchText.split("memiliki arti: ")[1].split("Nama:")[0].trim(),
                catatan: "Gunakan juga aplikasi numerologi Kecocokan Nama, untuk melihat sejauh mana keselarasan nama anda dengan diri anda.",
            };
        }
        catch (e) {
            hasil = {
                status: false,
                message: `Tidak ditemukan arti nama "${nama}". Cari dengan kata kunci yang lain.`,
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
        endpoint: "/api/primbon/artinama",
        name: "arti nama",
        category: "Primbon",
        description: "This API endpoint allows users to retrieve the meaning of a given name from Primbon.",
        tags: ["Primbon", "Name Meaning", "Culture"],
        example: "?nama=putu",
        parameters: [
            {
                name: "nama",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "The name to search for.",
                example: "putu",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { nama } = req.query || {};
            if (!nama) {
                return {
                    status: false,
                    error: "Parameter 'nama' is required",
                    code: 400,
                };
            }
            if (typeof nama !== "string" || nama.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'nama' must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrape(nama.trim());
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
