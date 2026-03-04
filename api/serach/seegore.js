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
async function ssearchgore(query) {
    try {
        const dataa = await axios_1.default.get("https://seegore.com/?s=" + query);
        const $$$ = cheerio.load(dataa.data);
        let pagina = $$$("#main > div.container.main-container > div > div.bb-col.col-content > div > div > div > div > nav > ul > li:nth-child(4) > a").text();
        let slink = "https://seegore.com/?s=" + query;
        const { data } = await axios_1.default.get(slink);
        const $ = cheerio.load(data);
        const link = [];
        const judul = [];
        const uploader = [];
        const format = [];
        const thumb = [];
        $("#post-items > li > article > div.content > header > h2 > a").each(function (a, b) {
            link.push($(b).attr("href"));
        });
        $("#post-items > li > article > div.content > header > h2 > a").each(function (c, d) {
            let jud = $(d).text();
            judul.push(jud);
        });
        $("#post-items > li > article > div.content > header > div > div.bb-cat-links > a").each(function (e, f) {
            let upl = $(f).text();
            uploader.push(upl);
        });
        $("#post-items > li > article > div.post-thumbnail > a > div > img").each(function (g, h) {
            thumb.push($(h).attr("src"));
        });
        for (let i = 0; i < link.length; i++) {
            format.push({
                judul: judul[i],
                uploader: uploader[i],
                thumb: thumb[i],
                link: link[i],
            });
        }
        return format;
    }
    catch (error) {
        throw new Error(`Error searching Seegore: ${error.message}`);
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/s/seegore",
        name: "seegore",
        category: "Search",
        description: "This API allows users to search for videos on Seegore.com using a search query.",
        tags: ["Search", "Video", "Scraper"],
        example: "?query=train",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "Search query",
                example: "train",
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
            if (query.length > 100) {
                return {
                    status: false,
                    error: "Query must be less than 100 characters",
                    code: 400,
                };
            }
            try {
                const result = await ssearchgore(query.trim());
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
