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
import * as queryString from 'querystring';
const baseURL = "http://images.google.com/search?";
const imageFileExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"];
function addSiteExcludePrefix(s) {
    return "-site:" + s;
}
function containsAnyImageFileExtension(s) {
    const lowercase = s.toLowerCase();
    return imageFileExtensions.some((ext) => lowercase.includes(ext));
}
async function scrapeGoogleImages(searchTerm, queryStringAddition = null, filterOutDomains = ["gstatic.com"], userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36") {
    try {
        let url = baseURL +
            queryString.stringify({
                tbm: "isch",
                q: searchTerm,
            });
        if (filterOutDomains && filterOutDomains.length > 0) {
            url += encodeURIComponent(" " + filterOutDomains.map(addSiteExcludePrefix).join(" "));
        }
        if (queryStringAddition) {
            url += queryStringAddition;
        }
        const reqOpts = {
            url,
            headers: {
                "User-Agent": userAgent,
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            },
            timeout: 30000,
        };
        const { data: body } = await (0, axios_1.default)(reqOpts);
        const $ = cheerio.load(body);
        const scripts = $("script");
        const scriptContents = [];
        for (let i = 0; i < scripts.length; ++i) {
            if (scripts[i].children.length > 0) {
                const content = scripts[i].children[0].data;
                if (content && containsAnyImageFileExtension(content)) {
                    scriptContents.push(content);
                }
            }
        }
        const allRefs = scriptContents.flatMap(collectImageRefs);
        const cleanedRefs = allRefs.map(cleanImageRef).filter(isValidRef);
        const uniqueRefs = removeDuplicates(cleanedRefs);
        return uniqueRefs;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from Google Images API");
    }
    function collectImageRefs(content) {
        const refs = [];
        const patterns = [
            /\["(https?:\/\/[^"]+?)",(\d+),(\d+)\]/g,
            /"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|gif|bmp|svg)[^"]*?)"/gi,
        ];
        patterns.forEach(function (pattern) {
            let result;
            while ((result = pattern.exec(content)) !== null) {
                if (result.length >= 4) {
                    let ref = {
                        url: result[1],
                        width: +result[3] || 0,
                        height: +result[2] || 0,
                    };
                    if (domainIsOK(ref.url) && isImageUrl(ref.url)) {
                        refs.push(ref);
                    }
                }
                else if (result.length >= 2) {
                    let ref = {
                        url: result[1],
                        width: 0,
                        height: 0,
                    };
                    if (domainIsOK(ref.url) && isImageUrl(ref.url)) {
                        refs.push(ref);
                    }
                }
            }
        });
        return refs;
    }
    function cleanImageRef(ref) {
        let cleanUrl = ref.url
            .replace(/\\u003d/g, "=")
            .replace(/\\u0026/g, "&")
            .replace(/\\u003c/g, "<")
            .replace(/\\u003e/g, ">")
            .replace(/\\u0022/g, "\"")
            .replace(/\\u0027/g, "'")
            .replace(/\\"/g, "\"")
            .replace(/\\\//g, "/")
            .replace(/\\n/g, "")
            .replace(/\\t/g, "")
            .replace(/\\r/g, "")
            .replace(/\\/g, "");
        try {
            cleanUrl = decodeURIComponent(cleanUrl);
        }
        catch (e) {
            // ignore decode errors
        }
        return {
            url: cleanUrl,
            width: ref.width,
            height: ref.height,
        };
    }
    function isValidRef(ref) {
        return (ref.url &&
            ref.url.startsWith("http") &&
            ref.url.length > 10 &&
            !ref.url.includes("undefined") &&
            !ref.url.includes("null"));
    }
    function removeDuplicates(refs) {
        const seen = new Set();
        return refs.filter(function (ref) {
            if (seen.has(ref.url)) {
                return false;
            }
            seen.add(ref.url);
            return true;
        });
    }
    function isImageUrl(url) {
        const lowerUrl = url.toLowerCase();
        return imageFileExtensions.some(function (ext) {
            return lowerUrl.includes(ext);
        });
    }
    function domainIsOK(url) {
        if (!filterOutDomains) {
            return true;
        }
        else {
            return filterOutDomains.every(skipDomainIsNotInURL);
        }
        function skipDomainIsNotInURL(skipDomain) {
            return url.indexOf(skipDomain) === -1;
        }
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/images",
        name: "google image",
        category: "Search",
        description: "This API endpoint allows users to search for images on Google Images by providing a search query.",
        tags: ["Search", "Image", "Google"],
        example: "?query=siputzx",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "The search term for Google Images",
                example: "siputzx",
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
            try {
                const results = await scrapeGoogleImages(query.trim());
                return {
                    status: true,
                    data: results,
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
