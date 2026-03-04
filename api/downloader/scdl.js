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
import * as querystring from 'querystring';
const clientID = "KKzJxmw11tYpCs6T24P4uUYhqmjalG6M";
class SoundCloudAPI {
    clientID;
    logLevel;
    constructor() {
        this.clientID = clientID;
        this.logLevel = {
            dump: (req) => {
                // console.log(`${req.method} ${req.url}`);
            },
        };
    }
    async resolve(addr) {
        const params = querystring.stringify({
            client_id: this.clientID,
            url: addr,
        });
        const url = `https://api-v2.soundcloud.com/resolve?${params}`;
        try {
            this.logLevel.dump({ method: "GET", url });
            const response = await axios_1.default.get(url, { timeout: 30000 });
            if (response.data.kind === "track") {
                return new Track(response.data);
            }
            const userTracksResponse = await this.userTracks(response.data.id);
            return userTracksResponse[0]; // Assuming the first track is the desired one
        }
        catch (error) {
            throw new Error(`Failed to resolve URL: ${error.message}`);
        }
    }
    async userTracks(id) {
        const params = querystring.stringify({
            client_id: this.clientID,
            limit: "1",
        });
        const url = `https://api-v2.soundcloud.com/users/${id}/tracks?${params}`;
        try {
            this.logLevel.dump({ method: "GET", url });
            const response = await axios_1.default.get(url, { timeout: 30000 });
            return response.data.collection.map((track) => new Track(track));
        }
        catch (error) {
            throw new Error(`Failed to fetch user tracks: ${error.message}`);
        }
    }
}
class Track {
    artwork_url;
    user;
    media;
    title;
    full_duration;
    duration;
    description;
    constructor(data) {
        Object.assign(this, data);
    }
    artwork() {
        let artworkUrl = this.artwork_url;
        if (!artworkUrl) {
            artworkUrl = this.user.avatar_url;
        }
        return artworkUrl ? artworkUrl.replace("large", "t500x") : null;
    }
    async progressive() {
        let progressiveUrl = null;
        for (const coding of this.media.transcodings) {
            if (coding.format.protocol === "progressive") {
                progressiveUrl = coding.url;
                break;
            }
        }
        if (!progressiveUrl) {
            throw new Error("No progressive streaming URL found");
        }
        const url = `${progressiveUrl}?client_id=${clientID}`;
        try {
            const response = await axios_1.default.get(url, { timeout: 30000 });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get progressive URL: ${error.message}`);
        }
    }
}
async function scrapeSoundCloud(url) {
    try {
        const soundcloud = new SoundCloudAPI();
        const trackData = await soundcloud.resolve(url);
        if (!trackData) {
            return null;
        }
        const media = await trackData.progressive();
        if (!media || !media.url) {
            return null;
        }
        return {
            title: trackData.title,
            url: media.url,
            thumbnail: trackData.artwork(),
            duration: trackData.full_duration || trackData.duration,
            user: trackData.user.username,
            description: trackData.description || "",
        };
    }
    catch (error) {
        console.error("SoundCloud scraping error:", error);
        return null;
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/d/soundcloud",
        name: "soundCloud",
        category: "Downloader",
        description: "This API endpoint allows you to download audio from a SoundCloud track by providing its URL as a query parameter.",
        tags: ["DOWNLOADER", "SoundCloud", "Audio", "Music"],
        example: "?url=https://m.soundcloud.com/teguh-hariyadi-652597010/anji-dia",
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
                description: "SoundCloud track URL",
                example: "https://m.soundcloud.com/teguh-hariyadi-652597010/anji-dia",
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
                    error: "URL parameter is required.",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "URL parameter must be a non-empty string.",
                    code: 400,
                };
            }
            let parsedUrl;
            try {
                parsedUrl = new URL(url.trim());
            }
            catch (e) {
                return {
                    status: false,
                    error: "Invalid URL format.",
                    code: 400,
                };
            }
            if (!parsedUrl.hostname.includes("soundcloud.com")) {
                return {
                    status: false,
                    error: "Invalid SoundCloud URL.",
                    code: 400,
                };
            }
            if (parsedUrl.hostname.startsWith("m.")) {
                parsedUrl.hostname = parsedUrl.hostname.replace(/^m\./, "");
            }
            try {
                const result = await scrapeSoundCloud(parsedUrl.toString());
                if (!result) {
                    return {
                        status: false,
                        error: "Track not found or download link not available.",
                        code: 404,
                    };
                }
                return {
                    status: true,
                    data: result,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (err) {
                console.error("SoundCloud downloader error:", err);
                return {
                    status: false,
                    error: err.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    }
];
