const { cmd } = require("../command.cjs");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

ffmpeg.setFfmpegPath(ffmpegPath);

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

/**
 * ✅ Download Media
 */
const downloadMedia = async (message, type) => {
    try {
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        return null;
    }
};

/**
 * ✅ Smart Media Detection (FIXED)
 */
const getMedia = (m, quoted) => {

    let msg = quoted?.message || quoted || m?.message;

    if (!msg) return null;

    if (msg.imageMessage) return { data: msg.imageMessage, type: "image" };
    if (msg.videoMessage) return { data: msg.videoMessage, type: "video" };
    if (msg.stickerMessage) return { data: msg.stickerMessage, type: "sticker" };

    let ctx = msg.extendedTextMessage?.contextInfo?.quotedMessage;
    if (ctx) {
        if (ctx.imageMessage) return { data: ctx.imageMessage, type: "image" };
        if (ctx.videoMessage) return { data: ctx.videoMessage, type: "video" };
        if (ctx.stickerMessage) return { data: ctx.stickerMessage, type: "sticker" };
    }

    return null;
};

/**
 * 🧠 Sticker Command
 */
cmd({
    pattern: "sticker",
    alias: ["s", "st"],
    react: "🌟",
    desc: "Create sticker (fit, crop, circle, stretch, nobg)",
    category: "convert",
    filename: __filename
},
async (zanta, mek, m, { from, reply, quoted, body }) => {

    try {

        // ===== MODE =====
        const formatArg = body.split(" ")[1]?.toLowerCase() || "fit";
        const allowedModes = ["fit", "crop", "circle", "stretch", "nobg"];
        const mode = allowedModes.includes(formatArg) ? formatArg : "fit";

        // ===== MEDIA =====
        let media = getMedia(m, quoted);

        if (!media || (media.type !== "image" && media.type !== "video")) {
            return reply("❌ Reply to an image/video\nExample: .sticker crop");
        }

        reply("⏳ Creating sticker...");

        // ===== DOWNLOAD =====
        const buffer = await downloadMedia(media.data, media.type);
        if (!buffer) return reply("❌ Failed to download media");

        // ===== FILE PATHS =====
        const input = path.join(tempDir, `in_${Date.now()}.${media.type === "image" ? "jpg" : "mp4"}`);
        const output = path.join(tempDir, `out_${Date.now()}.webp`);

        fs.writeFileSync(input, buffer);

        // ===== FILTERS =====
        let filter = "";

        switch (mode) {

            case "crop":
                filter = "scale=512:512:force_original_aspect_ratio=increase,crop=512:512";
                break;

            case "circle":
                filter =
                    "scale=512:512:force_original_aspect_ratio=decrease," +
                    "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0," +
                    "geq='lum=255:cb=128:cr=128:alpha=if((X-256)^2+(Y-256)^2<65536,255,0)'";
                break;

            case "stretch":
                filter = "scale=512:512";
                break;

            case "nobg":
                filter =
                    "scale=512:512:force_original_aspect_ratio=decrease," +
                    "colorkey=0x00FF00:0.3:0.1," +
                    "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0";
                break;

            default: // fit
                filter =
                    "scale=512:512:force_original_aspect_ratio=decrease," +
                    "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0";
        }

        // ===== FFMPEG PROCESS =====
        await new Promise((resolve, reject) => {

            let command = ffmpeg(input)
                .outputOptions([
                    "-vcodec libwebp",
                    "-lossless 1",
                    "-qscale 75",
                    "-preset default",
                    "-loop 0",
                    "-an",
                    "-vsync 0"
                ])
                .videoFilters(media.type === "video" ? `${filter},fps=15` : filter)
                .on("end", resolve)
                .on("error", reject)
                .save(output);
        });

        // ===== SEND =====
        await zanta.sendMessage(from, {
            sticker: fs.readFileSync(output),
            packname: "Your Pack",
            author: "Your Bot"
        }, { quoted: mek });

        // ===== CLEAN =====
        fs.unlinkSync(input);
        fs.unlinkSync(output);

    } catch (err) {
        console.log("Sticker Error:", err);
        reply("❌ Failed to create sticker");
    }
});


/**
 * 🖼️ Sticker → Image
 */
cmd({
    pattern: "toimg",
    react: "🖼️",
    desc: "Sticker to image",
    category: "convert",
    filename: __filename
},
async (zanta, mek, m, { from, reply, quoted }) => {

    try {

        let media = getMedia(m, quoted);

        if (!media || media.type !== "sticker") {
            return reply("❌ Reply to a sticker");
        }

        reply("⏳ Converting...");

        const buffer = await downloadMedia(media.data, "sticker");

        const input = path.join(tempDir, `st_${Date.now()}.webp`);
        const output = path.join(tempDir, `img_${Date.now()}.png`);

        fs.writeFileSync(input, buffer);

        await new Promise((resolve, reject) => {
            ffmpeg(input)
                .on("end", resolve)
                .on("error", reject)
                .save(output);
        });

        await zanta.sendMessage(from, {
            image: fs.readFileSync(output),
            caption: "✅ Converted"
        }, { quoted: mek });

        fs.unlinkSync(input);
        fs.unlinkSync(output);

    } catch (e) {
        reply("❌ Error converting sticker");
    }
});
