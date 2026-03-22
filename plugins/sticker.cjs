const { cmd } = require("../command.cjs");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

ffmpeg.setFfmpegPath(ffmpegPath);

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

/**
 * Safe delete
 */
const safeDelete = (file) => {
    try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch {}
};

/**
 * Download media buffer
 */
const downloadMedia = async (msg, type) => {
    try {
        const stream = await downloadContentFromMessage(msg, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        console.log("Download error:", e);
        return null;
    }
};

/**
 * 🔥 BEST MEDIA DETECTOR (handles all cases)
 */
const getMedia = (m) => {
    let msg = m?.quoted?.message || m?.message || {};

    // unwrap special types
    if (msg?.ephemeralMessage) msg = msg.ephemeralMessage.message;
    if (msg?.viewOnceMessage) msg = msg.viewOnceMessage.message;

    if (!msg) return null;

    if (msg.imageMessage) return { data: msg.imageMessage, type: "image", ext: "jpg" };
    if (msg.videoMessage) return { data: msg.videoMessage, type: "video", ext: "mp4" };
    if (msg.stickerMessage) return { data: msg.stickerMessage, type: "sticker", ext: "webp" };

    return null;
};



/* =========================
   🖼️ IMAGE/VIDEO → STICKER
========================= */
cmd({
    pattern: "sticker",
    alias: ["s", "st"],
    react: "🌟",
    desc: "Convert media to sticker",
    category: "convert",
    filename: __filename,
}, async (zanta, mek, m, { from, reply }) => {
    try {
        const media = getMedia(m);

        if (!media || (media.type !== "image" && media.type !== "video")) {
            return reply("*Reply to image/video or send one* ❌");
        }

        reply("*Creating sticker...* ⏳");

        const buffer = await downloadMedia(media.data, media.type);
        if (!buffer) return reply("Download failed ❌");

        const input = path.join(tempDir, `in_${Date.now()}.${media.ext}`);
        const output = path.join(tempDir, `out_${Date.now()}.webp`);

        fs.writeFileSync(input, buffer);

        ffmpeg(input)
            .on("end", async () => {
                await zanta.sendMessage(
                    from,
                    {
                        sticker: fs.readFileSync(output),
                        packname: "QUEEN-NILU-MD",
                        author: "Sticker-Bot",
                    },
                    { quoted: mek }
                );

                safeDelete(input);
                safeDelete(output);
            })
            .on("error", (err) => {
                console.log("FFmpeg error:", err);
                reply("Conversion failed ❌");
                safeDelete(input);
                safeDelete(output);
            })
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf",
                "scale=320:320:force_original_aspect_ratio=decrease," +
                "pad=320:320:(ow-iw)/2:(oh-ih)/2:color=white@0.0"
            ])
            .save(output);

    } catch (e) {
        console.log(e);
        reply("Error occurred ❌");
    }
});



/* =========================
   🎡 STICKER → IMAGE
========================= */
cmd({
    pattern: "toimg",
    react: "🖼️",
    desc: "Convert sticker to image",
    category: "convert",
    filename: __filename,
}, async (zanta, mek, m, { from, reply }) => {
    try {
        const media = getMedia(m);

        if (!media || media.type !== "sticker") {
            return reply("*Reply to sticker* ❌");
        }

        reply("*Converting...* ⏳");

        const buffer = await downloadMedia(media.data, "sticker");
        if (!buffer) return reply("Download failed ❌");

        const input = path.join(tempDir, `in_${Date.now()}.webp`);
        const output = path.join(tempDir, `out_${Date.now()}.png`);

        fs.writeFileSync(input, buffer);

        ffmpeg(input)
            .on("end", async () => {
                await zanta.sendMessage(
                    from,
                    {
                        image: fs.readFileSync(output),
                        caption: "> *Converted Successfully*",
                    },
                    { quoted: mek }
                );

                safeDelete(input);
                safeDelete(output);
            })
            .on("error", (err) => {
                console.log("FFmpeg error:", err);
                reply("Conversion failed ❌");
                safeDelete(input);
                safeDelete(output);
            })
            .save(output);

    } catch (e) {
        console.log(e);
        reply("Error occurred ❌");
    }
});

module.exports = {};
