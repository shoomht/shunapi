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
import __form_data_1 from 'form-data';
const form_data_1 = { default: __form_data_1 };
async function getBaseUrl() {
    try {
        const response = await axios_1.default.get(proxy() + "https://samehadaku.care/", {
            timeout: 30000,
        });
        const $ = cheerio.load(response.data);
        const scriptContent = $('script')
            .filter(function () {
            return $(this).html().includes("window.location.href");
        })
            .html();
        const urlMatch = scriptContent.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (urlMatch) {
            return urlMatch[1];
        }
        else {
            throw new Error("Base URL not found");
        }
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
async function getSamehadakuDownload(url) {
    try {
        const baseUrl = await getBaseUrl();
        if (!/samehadaku\.\w+\/[\w-]+episode/gi.test(url)) {
            throw new Error("Invalid URL!");
        }
        const html = await axios_1.default.get(proxy() + url, {
            headers: {
                "authority": "samehadaku.care",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "max-age=0",
                "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": '"Android"',
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
            },
            timeout: 30000,
        });
        if (html.statusText !== "OK")
            throw new Error("Error Fetching");
        const $ = cheerio.load(html.data);
        const data = {
            title: $('h1[itemprop="name"]').text().trim(),
            link: url,
            downloads: [],
        };
        const downloadItems = $('div#server > ul > li').toArray();
        data.downloads = await Promise.all(downloadItems.map(async (el) => {
            const v = {
                name: $(el).find('span').text().trim(),
                post: $(el).find('div').attr('data-post') || '',
                nume: $(el).find('div').attr('data-nume') || '',
                type: $(el).find('div').attr('data-type') || '',
                link: "",
            };
            const formData = new form_data_1.default();
            formData.append("action", "player_ajax");
            formData.append("post", v.post);
            formData.append("nume", v.nume);
            formData.append("type", v.type);
            try {
                const res = await axios_1.default.post(proxy() + baseUrl + "/wp-admin/admin-ajax.php", formData, {
                    headers: {
                        "authority": "samehadaku.care",
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                        "cache-control": "max-age=0",
                        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
                        "sec-ch-ua-mobile": "?1",
                        "sec-ch-ua-platform": '"Android"',
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
                        "origin": new URL(baseUrl).origin,
                        ...formData.getHeaders(),
                    },
                    timeout: 30000,
                });
                const iframe = cheerio.load(res.data)("iframe").attr("src");
                v.link = iframe || "";
            }
            catch (e) {
                v.link = "";
            }
            return v;
        }));
        return data;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/anime/samehadaku/download",
        name: "samehadaku download",
        category: "Anime",
        description: "This API endpoint retrieves download links for a specific anime episode from Samehadaku.",
        tags: ["Anime", "Samehadaku", "Download"],
        example: "?url=https://samehadaku.email/rekishi-ni-nokoru-akujo-ni-naru-zo-episode-9",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
                description: "Anime episode URL",
                example: "https://samehadaku.email/rekishi-ni-nokoru-akujo-ni-naru-zo-episode-9",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { url } = req.query || {};
            if (!url) {
                return {
                    status: false,
                    error: "URL parameter is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "URL parameter must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const data = await getSamehadakuDownload(url.trim());
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
