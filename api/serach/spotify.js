var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import buffer_1 from 'buffer';
function convert(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (Number(seconds) < 10 ? "0" : "") + seconds;
}
async function spotifyCreds() {
    try {
        const response = await axios_1.default.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " +
                    buffer_1.Buffer.from(`7bbae52593da45c69a27c853cc22edff:88ae1f7587384f3f83f62a279e7f87af`).toString("base64"),
            },
            timeout: 30000,
        });
        return response.data.access_token
            ? { status: true, access_token: response.data.access_token }
            : { status: false, msg: "Can't generate token!" };
    }
    catch (e) {
        console.error("API Error:", e.message);
        return { status: false, msg: e.message };
    }
}
async function searchSpotify(query, type = "track", limit = 20) {
    try {
        const creds = await spotifyCreds();
        if (!creds.status)
            return creds;
        const response = await axios_1.default.get("https://api.spotify.com/v1/search", {
            headers: { Authorization: `Bearer ${creds.access_token}` },
            params: {
                q: query,
                type,
                limit: Math.min(limit, 50),
                market: "US",
            },
            timeout: 30000,
        });
        const tracks = response.data.tracks.items;
        if (!tracks.length)
            return { status: false, msg: "No tracks found!" };
        const results = tracks.map((item) => ({
            track_url: item.external_urls.spotify,
            thumbnail: item.album.images[0]?.url || "No thumbnail available",
            title: `${item.artists[0].name} - ${item.name}`,
            artist: item.artists[0].name,
            duration: convert(item.duration_ms),
            preview_url: item.preview_url || "No preview available",
            album: item.album.name,
            release_date: item.album.release_date,
        }));
        return {
            status: true,
            data: results,
            total_results: response.data.tracks.total,
        };
    }
    catch (e) {
        console.error("API Error:", e.message);
        return { status: false, msg: e.message };
    }
}
export default [
    {
        metode: "GET",
        endpoint: "/api/s/spotify",
        name: "spotify",
        category: "Search",
        description: "This API endpoint allows you to search for tracks on Spotify.",
        tags: ["Search", "Spotify", "Music"],
        example: "?query=serana",
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
                example: "serana",
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
                const result = await searchSpotify(query.trim());
                if (!result.status) {
                    return {
                        status: false,
                        error: result.msg || "No tracks found!",
                        code: 404,
                    };
                }
                return {
                    status: true,
                    data: result.data,
                    total_results: result.total_results,
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
