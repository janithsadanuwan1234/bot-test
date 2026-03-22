const { cmd } = require("../command.cjs");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

ffmpeg.setFfmpegPath(ffmpegPath);

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

/* ============================= */
/* 📥 DOWNLOAD MEDIA (FIXED) */
/* ============================= */
const downloadMedia = async (msg, type) => {
    try {
        const stream = await downloadContentFromMessage(msg, type);
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        return buffer;
    } catch (e) {
        console.log("Download Error:", e);
        return null;
    }
};

/* ============================= */
/* 🔍 GET MEDIA (FULL FIX) */
/* ============================= */
const getMedia = (m) => {
    try {
        let msg = m?.message || m;

        // viewOnce support
        if (msg?.viewOnceMessage) {
            msg = msg.viewOnceMessage.message;
        }

        // direct
        if (msg?.imageMessage) return { data: msg.imageMessage, type: "image" };
        if (msg?.videoMessage) return { data: msg.videoMessage, type: "video" };
        if (msg?.stickerMessage) return { data: msg.stickerMessage, type: "sticker" };

        // quoted
        let quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (quoted?.viewOnceMessage) {
            quoted = quoted.viewOnceMessage.message;
        }

        if (quoted?.imageMessage) return { data: quoted.imageMessage, type: "image" };
        if (quoted?.videoMessage) return { data: quoted.videoMessage, type: "video" };
        if (quoted?.stickerMessage) return { data: quoted.stickerMessage, type: "sticker" };

        return null;
    } catch {
        return null;
    }
};

/* ============================= */
/* 🖼️ IMAGE/VIDEO → STICKER */
/* ============================= */
cmd({
    pattern: "sticker",
    alias: ["s", "st"],
    react: "🌟",
    desc: "Convert media to sticker",
    category: "convert",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        const media = getMedia(m);

        if (!media || !["image", "video"].includes(media.type)) {
            return reply("*Reply to an image or video* ❌");
        }

        reply("*Processing...* ⏳");

        const buffer = await downloadMedia(media.data, media.type);
        if (!buffer) return reply("Download failed ❌");

        const inPath = path.join(tempDir, `input_${Date.now()}.${media.type === "image" ? "jpg" : "mp4"}`);
        const outPath = path.join(tempDir, `output_${Date.now()}.webp`);

        fs.writeFileSync(inPath, buffer);

        ffmpeg(inPath)
            .outputOptions([
                "-vcodec libwebp",
                "-vf scale=512:512:force_original_aspect_ratio=decrease," +
                "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0",
                "-loop 0",
                "-ss 00:00:00",
                "-t 10",
                "-preset default",
                "-an",
                "-vsync 0"
            ])
            .on("end", async () => {
                await zanta.sendMessage(from, {
                    sticker: fs.readFileSync(outPath),
                    packname: "QUEEN-NILU-MD",
                    author: "Sticker-Bot"
                }, { quoted: mek });

                fs.unlinkSync(inPath);
                fs.unlinkSync(outPath);
            })
            .on("error", (err) => {
                console.log(err);
                reply("FFmpeg Error ❌");
                if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
            })
            .save(outPath);

    } catch (e) {
        console.log(e);
        reply("Error ❌");
    }
});

/* ============================= */
/* 🎡 STICKER → IMAGE */
/* ============================= */
cmd({
    pattern: "toimg",
    react: "🖼️",
    desc: "Sticker to image",
    category: "convert",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        const media = getMedia(m);

        if (!media || media.type !== "sticker") {
            return reply("*Reply to a sticker* ❌");
        }

        reply("*Processing...* ⏳");

        const buffer = await downloadMedia(media.data, "sticker");
        if (!buffer) return reply("Download failed ❌");

        const inPath = path.join(tempDir, `input_${Date.now()}.webp`);
        const outPath = path.join(tempDir, `output_${Date.now()}.png`);

        fs.writeFileSync(inPath, buffer);

        ffmpeg(inPath)
            .on("end", async () => {
                await zanta.sendMessage(from, {
                    image: fs.readFileSync(outPath),
                    caption: "> *Converted Successfully*"
                }, { quoted: mek });

                fs.unlinkSync(inPath);
                fs.unlinkSync(outPath);
            })
            .on("error", (err) => {
                console.log(err);
                reply("FFmpeg Error ❌");
                if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
            })
            .save(outPath);

    } catch (e) {
        console.log(e);
        reply("Error ❌");
    }
});

module.exports = {};
