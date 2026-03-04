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
import * as https from 'node:https';
import __user_agents_1 from 'user-agents';
const user_agents_1 = { default: __user_agents_1 };
import __form_data_1 from 'form-data';
const form_data_1 = { default: __form_data_1 };
import file_type_1 from 'file-type';
import buffer_1 from 'buffer';
const UPLOAD = "https://kolorize.cc/api/upload";
const TICKET = "https://kolorize.cc/ticket";
const LOOKUP = "https://kolorize.cc/api/lookup";
const agent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
});
const userAgent = new user_agents_1.default();
const ua = userAgent.random().toString();
let headersList = {
    "authority": "kolorize.cc",
    "accept": "*/*",
    "accept-language": "id-ID,id;q=0.9",
    "cache-control": "no-cache",
    "origin": "https://kolorize.cc",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "referer": "https://kolorize.cc/",
    "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": ua,
};
const createImageResponse = (buffer, filename = null) => {
    const headers = {
        "Content-Type": "image/webp",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
    };
    if (filename) {
        headers["Content-Disposition"] = `inline; filename="${filename}"`;
    }
    return new Response(buffer, { headers });
};
async function _req({ url, method = "GET", data = null, params = null, head = null, response = "json" }) {
    try {
        let headers = {};
        let param;
        let datas;
        if (head && (head == "original" || head == "ori")) {
            const uri = new URL(url);
            headers = {
                authority: uri.hostname,
                origin: "https://" + uri.hostname,
                "Cache-Control": "no-cache",
                "user-agent": ua,
            };
        }
        else if (head && typeof head == "object") {
            headers = head;
        }
        if (params && typeof params == "object") {
            param = params;
        }
        else {
            param = "";
        }
        if (data) {
            datas = data;
        }
        else {
            datas = "";
        }
        const options = {
            url: url,
            method: method,
            headers,
            timeout: 30_000,
            responseType: response,
            httpsAgent: agent,
            withCredentials: true,
            validateStatus: (status) => {
                return status <= 500;
            },
            ...(!datas ? {} : { data: datas }),
            ...(!params ? {} : { params: param }),
        };
        const res = await axios_1.default.request(options);
        if (res.headers["set-cookie"]) {
            res.headers["set-cookie"].forEach((v) => {
                if (head && typeof head === "object") {
                    head["cookie"] = v.split(";")[0];
                }
            });
        }
        return res;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
async function _upload(buffer, fileName = "image.jpg") {
    const form = new form_data_1.default();
    form.append("files", buffer, {
        filename: fileName,
        contentType: "image/jpeg",
    });
    const res = await _req({
        url: UPLOAD,
        method: "POST",
        data: form,
        head: {
            ...headersList,
            ...form.getHeaders(),
        },
    });
    return res.data;
}
async function _getTicket(data, prompt) {
    const payload = {
        "type": "colorize_v2",
        "fnKey": data.results[0].sourceKey,
        "w": data.results[0].w,
        "h": data.results[0].h,
        "prompt": prompt,
        "tries": 0,
        "seq": 0,
        "dpi": data.results[0].dpi,
    };
    const res = await _req({
        url: TICKET,
        method: "POST",
        data: payload,
        head: headersList,
    });
    return res.data;
}
async function _lookup(id) {
    const payload = {
        "keyOrUrl": id,
        "mode": 3,
        "r": 1.5,
        "forceH": 0,
    };
    let res = await _req({
        url: LOOKUP,
        method: "POST",
        data: payload,
        head: headersList,
    });
    return res.data;
}
function _task(ticket) {
    let results = [];
    return new Promise(async (resolve, reject) => {
        try {
            const res = await _req({
                url: TICKET,
                method: "GET",
                params: {
                    ticket,
                },
                response: "stream",
                head: headersList,
            });
            res.data.on("data", (data) => {
                results.push(data.toString());
            });
            res.data.on("end", () => {
                resolve(results.pop());
            });
            res.data.on("error", (error) => {
                reject(error);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
async function ColorizeImageFromUrl(imageUrl, prompt) {
    const kb = await _req({
        url: imageUrl,
        method: "GET",
        response: "arraybuffer",
        head: "ori",
    });
    const buffer = buffer_1.Buffer.from(kb.data);
    const fileType = await (0, file_type_1.fileTypeFromBuffer)(buffer);
    if (!fileType || !fileType.mime.startsWith("image/")) {
        throw new Error("Unsupported file type, only images are allowed.");
    }
    const fileName = `image.${fileType.ext}`;
    const upload = await _upload(buffer, fileName);
    const ticket = await _getTicket(upload, prompt);
    const task = await _task(ticket.ticket);
    const jTask = JSON.parse(task);
    const lookup2 = await _lookup(jTask.outputKey);
    if (!lookup2 || !lookup2.imgUrl) {
        throw new Error("Failed to get result image URL.");
    }
    return {
        prompt: jTask.prompt,
        outputKey: jTask.outputKey,
        buffer: buffer_1.Buffer.from(lookup2.imgUrl.replace("data:image/webp;base64,", ""), "base64"),
    };
}
async function ColorizeImageFromFile(imageBuffer, prompt, fileName = "image.jpg") {
    const fileType = await (0, file_type_1.fileTypeFromBuffer)(imageBuffer);
    if (!fileType || !fileType.mime.startsWith("image/")) {
        throw new Error("Unsupported file type, only images are allowed.");
    }
    const finalFileName = fileName || `image.${fileType.ext}`;
    const upload = await _upload(imageBuffer, finalFileName);
    const ticket = await _getTicket(upload, prompt);
    const task = await _task(ticket.ticket);
    const jTask = JSON.parse(task);
    const lookup2 = await _lookup(jTask.outputKey);
    if (!lookup2 || !lookup2.imgUrl) {
        throw new Error("Failed to get result image URL.");
    }
    return {
        prompt: jTask.prompt,
        outputKey: jTask.outputKey,
        buffer: buffer_1.Buffer.from(lookup2.imgUrl.replace("data:image/webp;base64,", ""), "base64"),
    };
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/colorize",
        name: "colorize",
        category: "Tools",
        description: "This API endpoint colorizes a grayscale image using a provided URL.",
        tags: ["TOOLS", "IMAGE", "COLORIZE", "PHOTO-EDITING"],
        example: "?url=https://files.catbox.moe/258vhm.jpg",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                    minLength: 1,
                    maxLength: 2048,
                },
                description: "The URL of the grayscale image to colorize.",
                example: "https://files.catbox.moe/258vhm.jpg",
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
                    error: "Parameter 'url' is required.",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'url' must be a non-empty string.",
                    code: 400,
                };
            }
            try {
                new URL(url.trim());
                const result = await ColorizeImageFromUrl(url.trim(), "colorize image");
                return createImageResponse(result.buffer);
            }
            catch (error) {
                console.error("Error:", error);
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    }
];
