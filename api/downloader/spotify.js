var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
async function scrapeSpotify(url) {
    try {
        const initialResponse = await axios_1.default.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`, {
            headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                Referer: "https://spotifydownload.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
        });
        const { result } = initialResponse.data;
        const trackId = result.type === "album" ? result.tracks[0].id : result.id;
        const convertResponse = await axios_1.default.get(`https://api.fabdl.com/spotify/mp3-convert-task/${result.gid}/${trackId}`, {
            headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                Referer: "https://spotifydownload.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
        });
        const tid = convertResponse.data.result.tid;
        const progressResponse = await axios_1.default.get(`https://api.fabdl.com/spotify/mp3-convert-progress/${tid}`, {
            headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                Referer: "https://spotifydownload.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
        });
        return {
            title: result.name,
            type: result.type,
            artis: result.artists,
            durasi: result.type === "album" ? result.tracks[0].duration_ms : result.duration_ms,
            image: result.image,
            download: `https://api.fabdl.com${progressResponse.data.result.download_url}`,
            status: progressResponse.data.result.status,
        };
    }
    catch (error) {
        console.error("Spotify download error:", error);
        throw new Error("Failed to download from Spotify");
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/d/spotify",
        name: "Spotify",
        category: "Downloader",
        description: "This API endpoint allows you to download music from Spotify by providing a Spotify track or album URL.",
        tags: ["Downloader", "Spotify", "Music", "Audio", "MP3"],
        example: "?url=https://open.spotify.com/intl-id/track/5EWyweCJ5igLl6bjbGRmGm",
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
                description: "Spotify URL",
                example: "https://open.spotify.com/intl-id/track/5EWyweCJ5igLl6bjbGRmGm",
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
                    error: "Parameter URL is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter URL must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrapeSpotify(url.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "Failed to download from Spotify or no result returned",
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
