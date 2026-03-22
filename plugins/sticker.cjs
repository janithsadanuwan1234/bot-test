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
 * Safe delete
 */
const safeUnlink = (file) => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
};

/**
 * Download media (FIXED)
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
 * NEW: Better media detection (LATEST BAILEYS FIX)
 */
const getMedia = (m) => {
    if (!m) return null;

    const msg = m.message || m.msg || m;

    if (msg?.imageMessage) return { data: msg.imageMessage, type: "image" };
    if (msg?.videoMessage) return { data: msg.videoMessage, type: "video" };
    if (msg?.stickerMessage) return { data: msg.stickerMessage, type: "sticker" };

    const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (quoted?.imageMessage) return { data: quoted.imageMessage, type: "image" };
    if (quoted?.videoMessage) return { data: quoted.videoMessage, type: "video" };
    if (quoted?.stickerMessage) return { data: quoted.stickerMessage, type: "sticker" };

    return null;
};


// =======================================
// 1. IMAGE/VIDEO → STICKER
// =======================================
cmd({
    pattern: "sticker",
    alias: ["s", "st"],
    react: "🌟",
    desc: "Convert media to sticker",
    category: "convert",
    filename: __filename
}, async (zanta, mek, m, { from, reply }) => {
    try {
        const media = getMedia(m);

        if (!media) return reply("*Reply to image/video* ❌");

        reply("*Processing...* ⏳");

        const buffer = await downloadMedia(media.data, media.type);
        if (!buffer) return reply("❌ Failed to download media");

        const input = path.join(tempDir, `in_${Date.now()}.${media.type === "image" ? "jpg" : "mp4"}`);
        const output = path.join(tempDir, `out_${Date.now()}.webp`);

        fs.writeFileSync(input, buffer);

        ffmpeg(input)
            .on("end", async () => {
                await zanta.sendMessage(from, {
                    sticker: fs.readFileSync(output),
                }, { quoted: mek });

                safeUnlink(input);
                safeUnlink(output);
            })
            .on("error", (err) => {
                console.log(err);
                reply("❌ Conversion failed");
                safeUnlink(input);
            })
            .addOutputOptions([
                "-vcodec libwebp",
                "-vf scale=512:512:force_original_aspect_ratio=decrease,fps=15",
                "-loop 0",
                "-preset default",
                "-an",
                "-vsync 0"
            ])
            .save(output);

    } catch (e) {
        console.log(e);
        reply("❌ Error occurred");
    }
});


// =======================================
// 2. STICKER → IMAGE
// =======================================
cmd({
    pattern: "toimg",
    react: "🖼️",
    desc: "Sticker to image",
    category: "convert",
    filename: __filename
}, async (zanta, mek, m, { from, reply }) => {
    try {
        const media = getMedia(m);

        if (!media || media.type !== "sticker") {
            return reply("*Reply to sticker* ❌");
        }

        reply("*Processing...* ⏳");

        const buffer = await downloadMedia(media.data, "sticker");
        if (!buffer) return reply("❌ Failed to download");

        const input = path.join(tempDir, `in_${Date.now()}.webp`);
        const output = path.join(tempDir, `out_${Date.now()}.png`);

        fs.writeFileSync(input, buffer);

        ffmpeg(input)
            .on("end", async () => {
                await zanta.sendMessage(from, {
                    image: fs.readFileSync(output),
                    caption: "> Converted Successfully ✅"
                }, { quoted: mek });

                safeUnlink(input);
                safeUnlink(output);
            })
            .on("error", (err) => {
                console.log(err);
                reply("❌ Conversion failed");
                safeUnlink(input);
            })
            .save(output);

    } catch (e) {
        console.log(e);
        reply("❌ Error occurred");
    }
});

module.exports = {};
