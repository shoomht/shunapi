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
const characters = [
    "Aamon",
    "Assassin",
    "Jungler",
    "Akai",
    "Tank",
    "Aldous",
    "Fighter",
    "Alice",
    "Alpha",
    "Alucard",
    "Angela",
    "Support",
    "Roamer",
    "Argus",
    "EXP Laner",
    "Arlott",
    "Atlas",
    "Aulus",
    "Aurora",
    "Mage",
    "Badang",
    "Balmond",
    "Bane",
    "Barats",
    "Baxia",
    "Beatrix",
    "Marksman",
    "Gold Laner",
    "Belerick",
    "Benedetta",
    "Brody",
    "Bruno",
    "Carmilla",
    "Caecilion",
    "Mid Laner",
    "Chou",
    "Figter",
    "Cici",
    "Claude",
    "Clint",
    "Cyclops",
    "Diggie",
    "Dyrroth",
    "Edith",
    "Esmeralda",
    "Estes",
    "Eudora",
    "Fanny",
    "Faramis",
    "Floryn",
    "Franco",
    "Fredrinn",
    "Freya",
    "Gatotkaca",
    "Gloo",
    "Gord",
    "Granger",
    "Grock",
    "Guinevere",
    "Gusion",
    "Hanabi",
    "Hanzo",
    "Harith",
    "Harley",
    "Hayabusa",
    "Helcurt",
    "Hilda",
    "Hylos",
    "Irithel",
    "Ixia",
    "Jawhead",
    "Johnson",
    "Joy",
    "Asassin",
    "Julian",
    "Kadita",
    "Kagura",
    "Kaja",
    "Karina",
    "Karrie",
    "Khaleed",
    "Khufra",
    "Kimmy",
    "Lancelot",
    "Layla",
    "Leomord",
    "Lesley",
    "Ling",
    "Lolita",
    "Lunox",
    "Luo Yi",
    "Lylia",
    "Martis",
    "Masha",
    "Mathilda",
    "Melissa",
    "Minotaur",
    "Minsitthar",
    "Miya",
    "Moskov",
    "Nana",
    "Natalia",
    "Natan",
    "Novaria",
    "Odette",
    "Paquito",
    "Pharsa",
    "Phoveus",
    "Popol and Kupa",
    "Rafaela",
    "Roger",
    "Ruby",
    "Saber",
    "Selena",
    "Silvanna",
    "Sun",
    "Terizla",
    "Thamuz",
    "Tigreal",
    "Uranus",
    "Vale",
    "Valentina",
    "Valir",
    "Vexana",
    "Wanwan",
    "Xavier",
    "Yin",
    "Yu Zhong",
    "Yve",
    "Zhask",
    "Zilong",
];
async function scrape() {
    try {
        const query = characters[Math.floor(Math.random() * characters.length)];
        const url = `https://mobile-legends.fandom.com/wiki/${query}/Audio/id`;
        const response = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(response.data);
        const audioSrc = $("audio")
            .map((i, el) => $(el).attr("src"))
            .get();
        const randomAudio = audioSrc[Math.floor(Math.random() * audioSrc.length)];
        if (!randomAudio) {
            throw new Error(`No audio found for character: ${query}`);
        }
        return { name: query, audio: randomAudio };
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to fetch hero audio data");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/games/tebakheroml",
        name: "tebak hero ml",
        category: "Games",
        description: "This API endpoint provides a random Mobile Legends: Bang Bang hero and one of their in-game audio quotes.",
        tags: ["Games", "Mobile Legends", "MLBB", "Quiz", "Audio", "Entertainment"],
        example: "",
        parameters: [],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            try {
                const data = await scrape();
                if (!data) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: data,
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
