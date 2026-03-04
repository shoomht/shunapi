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
async function generateVcc(type, count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
        const response = await (0, axios_1.default)({
            method: "post",
            url: "https://neapay.com/online-tools/credit-card-number-generator-validator.html",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
            },
            data: `bin=${type}&generate=`,
        });
        const $ = cheerio.load(response.data);
        const cardFront = $(".card-front");
        const cardBack = $(".card-back");
        cards.push({
            cardNumber: cardFront
                .find("pre")
                .eq(0)
                .text()
                .trim()
                .replace(/\s+/g, ""),
            expirationDate: cardFront.find("pre").eq(1).text().trim(),
            cardholderName: cardFront.find("pre").eq(2).text().trim(),
            cvv: cardBack.find("pre").eq(0).text().trim(),
        });
    }
    return cards;
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/vcc-generator",
        name: "vcc generator",
        category: "Tools",
        description: "This API endpoint allows you to generate virtual credit card (VCC) details for various card types.",
        tags: ["TOOLS", "VCC", "GENERATOR"],
        example: "?type=MasterCard&count=3",
        parameters: [
            {
                name: "type",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    enum: ["Visa", "MasterCard", "Amex", "CUP", "JCB", "Diners", "RuPay"],
                },
                description: "Credit card type",
                example: "Visa",
            },
            {
                name: "count",
                in: "query",
                required: false,
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 5,
                    default: 1,
                },
                description: "Number of VCCs",
                example: 3,
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { type, count = 1 } = req.query || {};
            const availableTypes = [
                "Visa",
                "MasterCard",
                "Amex",
                "CUP",
                "JCB",
                "Diners",
                "RuPay",
            ];
            if (!type) {
                return {
                    status: false,
                    error: "Card type is required.",
                    code: 400,
                };
            }
            if (typeof type !== "string" || type.trim().length === 0) {
                return {
                    status: false,
                    error: "Card type must be a non-empty string.",
                    code: 400,
                };
            }
            if (!availableTypes.includes(type.trim())) {
                return {
                    status: false,
                    error: "Invalid card type.",
                    availableTypes: availableTypes,
                    code: 400,
                };
            }
            const parsedCount = parseInt(String(count).trim(), 10);
            if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 5) {
                return {
                    status: false,
                    error: "Count must be an integer between 1 and 5.",
                    code: 400,
                };
            }
            try {
                const cards = await generateVcc(type.trim(), parsedCount);
                return {
                    status: true,
                    count: cards.length,
                    data: cards,
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
