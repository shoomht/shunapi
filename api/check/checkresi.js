var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
import __axios_1 from 'axios';
const axios_1 = { default: __axios_1 };
import __qs_1 from 'qs';
const qs_1 = { default: __qs_1 };
const ntext = (text) => {
    return text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .replace(/\s+/g, "");
};
const getCourierList = async () => {
    try {
        const response = await axios_1.default.get("https://loman.id/resapp/getdropdown.php", {
            headers: {
                "user-agent": "Postify/1.0.0",
                "content-type": "application/x-www-form-urlencoded",
            },
            timeout: 5000,
        });
        if (response.data?.status !== "berhasil") {
            return {
                success: false,
                code: 500,
                result: { error: "Failed to retrieve courier list." },
            };
        }
        return {
            success: true,
            code: 200,
            result: {
                couriers: response.data.data.map((c) => ({
                    name: c.title,
                    normalized: ntext(c.title),
                })),
            },
        };
    }
    catch (err) {
        return {
            success: false,
            code: err.response?.status || 500,
            result: {
                error: "Failed to retrieve courier list.",
            },
        };
    }
};
const track = async (resi, courierName) => {
    if (!resi || !courierName) {
        return {
            success: false,
            code: 400,
            result: { error: "Tracking number and courier name are required." },
        };
    }
    try {
        const couriers = await getCourierList();
        if (!couriers.success)
            return couriers;
        const ni = ntext(courierName);
        const mc = couriers.result.couriers.find((c) => c.normalized.includes(ni) || ni.includes(c.normalized));
        if (!mc) {
            return {
                success: false,
                code: 404,
                result: {
                    error: `Courier "${courierName}" not found.`,
                    couriers: couriers.result.couriers.map((c) => c.name),
                },
            };
        }
        const data = qs_1.default.stringify({
            resi: resi,
            ex: mc.name,
        });
        const response = await axios_1.default.post("https://loman.id/resapp/", data, {
            headers: {
                "user-agent": "Postify/1.0.0",
                "content-type": "application/x-www-form-urlencoded",
            },
            timeout: 10000,
        });
        if (response.data?.status !== "berhasil") {
            return {
                success: false,
                code: 500,
                result: { error: "Failed to track package." },
            };
        }
        const history = Array.isArray(response.data.history)
            ? response.data.history.map((item) => ({
                datetime: item.tanggal,
                description: item.details,
                timestamp: new Date(item.tanggal.replace("Pukul", "")).getTime() || null,
            }))
            : [];
        return {
            success: true,
            code: 200,
            result: {
                courier: mc.name,
                resi: resi,
                status: response.data.details?.status || "Unknown",
                message: response.data.details?.infopengiriman || "",
                tips: response.data.details?.ucapan || "",
                history: history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
            },
        };
    }
    catch (err) {
        return {
            success: false,
            code: err.response?.status || 500,
            result: {
                error: "Failed to track package.",
            },
        };
    }
};
const searchCouriers = async (keyword) => {
    if (!keyword) {
        return {
            success: false,
            code: 400,
            result: { error: "Search keyword is required." },
        };
    }
    try {
        const couriers = await getCourierList();
        if (!couriers.success)
            return couriers;
        const nk = ntext(keyword);
        const found = couriers.result.couriers.filter((c) => c.normalized.includes(nk));
        if (found.length === 0) {
            return {
                success: false,
                code: 404,
                result: {
                    error: "No couriers found matching the keyword.",
                    suggestions: couriers.result.couriers.map((c) => c.name),
                },
            };
        }
        return {
            success: true,
            code: 200,
            result: {
                couriers: found.map((c) => c.name),
            },
        };
    }
    catch (err) {
        return {
            success: false,
            code: 500,
            result: { error: "Failed to search for couriers." },
        };
    }
};
export default [
    {
        metode: "GET",
        endpoint: "/api/check/resi",
        name: "Check Resi",
        category: "Check",
        description: "This API endpoint allows you to track your package shipment using tracking number (resi) and courier name via query p...",
        tags: ["LOMAN", "RESI", "TRACKING", "PACKAGE"],
        example: "?resi=1234567890&courier=JNE",
        parameters: [
            {
                name: "resi",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 50,
                },
                description: "Nomor resi/tracking number",
                example: "1234567890",
            },
            {
                name: "courier",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 50,
                },
                description: "Nama ekspedisi/courier name",
                example: "JNE",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { resi, courier } = req.query || {};
            if (!resi) {
                return {
                    status: false,
                    error: "Parameter 'resi' is required.",
                    code: 400,
                };
            }
            if (typeof resi !== "string" || resi.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'resi' must be a non-empty string.",
                    code: 400,
                };
            }
            if (!courier) {
                return {
                    status: false,
                    error: "Parameter 'courier' is required.",
                    code: 400,
                };
            }
            if (typeof courier !== "string" || courier.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'courier' must be a non-empty string.",
                    code: 400,
                };
            }
            try {
                const trackingResult = await track(resi.trim(), courier.trim());
                if (!trackingResult.success) {
                    return {
                        status: false,
                        error: trackingResult.result.error,
                        code: trackingResult.code,
                        couriers: trackingResult.result.couriers || undefined,
                    };
                }
                return {
                    status: true,
                    data: trackingResult.result,
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
