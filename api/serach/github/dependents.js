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
async function scrapeGitHubDependents(url, begin, end) {
    class GitHubScraper {
        headers;
        githubUrl;
        begin;
        end;
        uri;
        allResults;
        constructor(githubUrl, begin, end) {
            this.headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                TE: "Trailers",
            };
            this.githubUrl = githubUrl;
            this.begin = begin;
            this.end = end;
            this.uri = this.convertToDependentsUrl(githubUrl);
            this.allResults = [];
        }
        convertToDependentsUrl(githubUrl) {
            const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
            const match = githubUrl.match(regex);
            if (match) {
                const packageAuthor = match[1];
                const packageName = match[2];
                return `https://github.com/${packageAuthor}/${packageName}/network/dependents`;
            }
            else {
                throw new Error("Invalid GitHub URL");
            }
        }
        extractDataFromHtml($) {
            const jsonData = [];
            $('div.Box-row[data-test-id="dg-repo-pkg-dependent"]').each((index, element) => {
                const username = $(element)
                    .find('a[data-hovercard-type="user"]')
                    .text()
                    .trim();
                const avatarUrl = $(element).find("img.avatar").attr("src");
                const repoName = $(element)
                    .find('a[data-hovercard-type="repository"]')
                    .text()
                    .trim();
                const repoUrl = `https://github.com/${username}/${repoName}`;
                const stars = parseInt($(element).find("svg.octicon-star").parent().text().trim(), 10) || 0;
                const forks = parseInt($(element).find("svg.octicon-repo-forked").parent().text().trim(), 10) || 0;
                jsonData.push({
                    user: { username, avatar_url: avatarUrl },
                    repository: { name: repoName, url: repoUrl },
                    stars,
                    forks,
                });
            });
            return jsonData;
        }
        async fetchPage(uri, pageIndex) {
            try {
                const response = await axios_1.default.get(uri, { headers: this.headers });
                const $ = cheerio.load(response.data);
                const pageData = this.extractDataFromHtml($);
                this.allResults.push(...pageData);
                return {
                    html: response.data,
                    data: pageData,
                };
            }
            catch (error) {
                console.error(`Failed to fetch page ${pageIndex + 1}:`, error.message);
                return null;
            }
        }
        getPaginationUri(html) {
            const $ = cheerio.load(html);
            const paginationLink = $('div.BtnGroup[data-test-selector="pagination"] a')
                .last()
                .attr("href");
            return paginationLink ? `${paginationLink}` : null;
        }
        async getJsons() {
            let currentUri = this.uri;
            let currentPage = this.begin;
            let totalItems = 0;
            while (currentPage < this.end) {
                const result = await this.fetchPage(currentUri, currentPage);
                if (!result)
                    break;
                const nextUri = this.getPaginationUri(result.html);
                if (!nextUri)
                    break;
                currentUri = nextUri;
                currentPage++;
                totalItems += result.data.length;
            }
            return {
                status: true,
                total: totalItems,
                page: currentPage - this.begin + 1,
                data: this.allResults,
            };
        }
    }
    const scraper = new GitHubScraper(url, parseInt(begin.toString()), parseInt(end.toString()));
    return await scraper.getJsons();
}
export default [
    {
        metode: "GET",
        endpoint: "/api/github/dependents",
        name: "dependents",
        category: "Search",
        description: "This API endpoint allows you to retrieve a list of repositories that depend on a specified GitHub repository.",
        tags: ["GITHUB", "REPOSITORY", "DEPENDENTS", "SCRAPING", "DEVELOPER"],
        example: "?url=https://github.com/WhiskeySockets/Baileys&begin=0&end=2",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 200,
                    pattern: "^https:\\/\\/github\\.com\\/[^\\/]+\\/[^\\/]+$",
                },
                description: "The GitHub repository URL",
                example: "https://github.com/WhiskeySockets/Baileys",
            },
            {
                name: "begin",
                in: "query",
                required: false,
                schema: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },
                description: "Starting page for scraping",
                example: 0,
            },
            {
                name: "end",
                in: "query",
                required: false,
                schema: {
                    type: "integer",
                    minimum: 1,
                    maximum: 100,
                },
                description: "Ending page for scraping",
                example: 2,
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { url, begin, end } = req.query || {};
            if (!url) {
                return {
                    status: false,
                    error: "GitHub URL is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "URL must be a non-empty string",
                    code: 400,
                };
            }
            const githubUrlRegex = /^https:\/\/github\.com\/[^/]+\/[^/]+$/;
            if (!githubUrlRegex.test(url.trim())) {
                return {
                    status: false,
                    error: "Invalid GitHub URL format. Example: https://github.com/user/repo",
                    code: 400,
                };
            }
            const parsedBegin = begin ? parseInt(begin, 10) : 0;
            const parsedEnd = end ? parseInt(end, 10) : 2;
            if (isNaN(parsedBegin) || parsedBegin < 0 || parsedBegin > 100) {
                return {
                    status: false,
                    error: "Begin page must be a non-negative integer between 0 and 100.",
                    code: 400,
                };
            }
            if (isNaN(parsedEnd) || parsedEnd < 1 || parsedEnd > 100) {
                return {
                    status: false,
                    error: "End page must be a positive integer between 1 and 100.",
                    code: 400,
                };
            }
            if (parsedBegin > parsedEnd) {
                return {
                    status: false,
                    error: "Begin page cannot be greater than end page.",
                    code: 400,
                };
            }
            try {
                const results = await scrapeGitHubDependents(url.trim(), parsedBegin, parsedEnd);
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
