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
import __node_fetch_1 from 'node-fetch';
const node_fetch_1 = { default: __node_fetch_1 };
import * as cheerio from 'cheerio';
async function scrapeKbbi(q) {
    const response = await (0, node_fetch_1.default)(`https://kbbi.kemdikbud.go.id/entri/${encodeURIComponent(q)}`, {
        timeout: 30000,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
    });
    if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const isExist = !/tidak ditemukan/i.test($("body > div.container.body-content > h4[style=\"color:red\"]").text());
    if (!isExist) {
        throw new Error(`${q} does not exist!`);
    }
    const results = [];
    let isContent = false;
    let lastTitle;
    $("body > div.container.body-content")
        .children()
        .each((_, el) => {
        const tag = el.tagName;
        const elem = $(el);
        if (tag === "hr") {
            isContent = !isContent && !results.length;
        }
        if (tag === "h2" && isContent) {
            const indexText = elem.find("sup").text().trim();
            const index = parseInt(indexText) || 0;
            const title = elem.text().trim();
            results.push({
                index: index,
                title: title,
                means: [],
            });
            lastTitle = title;
        }
        if ((tag === "ol" || tag === "ul") && isContent && lastTitle) {
            elem.find("li").each((_, liEl) => {
                const li = $(liEl).text().trim();
                const index = results.findIndex(({ title }) => title === lastTitle);
                if (index !== -1) {
                    results[index].means.push(li);
                }
                else {
                    console.log(li, lastTitle);
                }
            });
            lastTitle = undefined;
        }
    });
    if (results.length === 0) {
        throw new Error(`${q} does not exist!`);
    }
    return results;
}
export default [
    {
        metode: "GET",
        endpoint: "/api/s/kbbi",
        name: "kbbi",
        category: "Search",
        description: "This API endpoint allows users to search for definitions of words in the official Indonesian Dictionary (KBBI).",
        tags: ["Search", "Dictionary", "Indonesian"],
        example: "?q=asu",
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
                description: "The word to search in KBBI",
                example: "asu",
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
                    error: "Query must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrapeKbbi(q.trim());
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
