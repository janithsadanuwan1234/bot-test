const { cmd } = require("../command.cjs");
const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { Sticker } = require("wa-sticker-formatter"); // ✅ NEW

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// 🔍 Get media
const getMediaMessage = (msg) => {
    let quoted = msg.quoted || msg;
    let m = quoted?.message || quoted;

    if (m?.imageMessage) return { message: { imageMessage: m.imageMessage }, type: "image" };
    if (m?.videoMessage) return { message: { videoMessage: m.videoMessage }, type: "video" };
    if (m?.stickerMessage) return { message: { stickerMessage: m.stickerMessage }, type: "sticker" };

    if (m?.extendedTextMessage?.contextInfo?.quotedMessage) {
        let q = m.extendedTextMessage.contextInfo.quotedMessage;
        if (q.imageMessage) return { message: { imageMessage: q.imageMessage }, type: "image" };
        if (q.videoMessage) return { message: { videoMessage: q.videoMessage }, type: "video" };
        if (q.stickerMessage) return { message: { stickerMessage: q.stickerMessage }, type: "sticker" };
    }

    return null;
};

// 🎯 STICKER COMMAND
cmd({
    pattern: "sticker",
    alias: ["s", "st"],
    react: "🌟",
    desc: "Create sticker with modes",
    category: "convert",
    filename: __filename
},
async (conn, mek, m, { from, reply, body }) => {
    try {
        const formatArg = body.split(" ")[1]?.toLowerCase() || "fit";
        const allowedModes = ["fit", "crop", "circle", "stretch", "nobg"];
        const mode = allowedModes.includes(formatArg) ? formatArg : "fit";

        let media = getMediaMessage(mek);
        if (!media) return reply("❌ Reply to image/video or send with caption");

        // 📥 Download
        const buffer = await downloadMediaMessage(
            media,
            "buffer",
            {},
            {
                logger: conn.logger,
                reuploadRequest: conn.updateMediaMessage
            }
        );

        const input = path.join(tempDir, `in_${Date.now()}.${media.type === "image" ? "jpg" : "mp4"}`);
        const output = path.join(tempDir, `out_${Date.now()}.webp`);

        fs.writeFileSync(input, buffer);

        // 🎨 Filters
        let filter = "";

        switch (mode) {
            case "crop":
                filter = "format=rgba,scale=512:512:force_original_aspect_ratio=increase,crop=512:512";
                break;

            case "circle":
                filter =
                    "format=rgba,scale=512:512:force_original_aspect_ratio=decrease," +
                    "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0," +
                    "geq='r=255:g=255:b=255:a=if((X-256)*(X-256)+(Y-256)*(Y-256)<65025,255,0)'";
                break;

            case "stretch":
                filter = "format=rgba,scale=512:512";
                break;

            case "nobg":
                filter =
                    "format=rgba,scale=512:512:force_original_aspect_ratio=decrease," +
                    "colorkey=0x00FF00:0.3:0.1," +
                    "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0";
                break;

            default:
                filter =
                    "format=rgba,scale=512:512:force_original_aspect_ratio=decrease," +
                    "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0";
        }

        // ⚙️ FFmpeg
        const args = media.type === "image"
            ? [
                "-i", input,
                "-vf", filter,
                "-vcodec", "libwebp",
                "-lossless", "1",
                "-qscale", "75",
                "-preset", "picture",
                "-loop", "0",
                "-an",
                "-vsync", "0",
                output
            ]
            : [
                "-i", input,
                "-vf", `${filter},fps=15`,
                "-vcodec", "libwebp",
                "-lossless", "1",
                "-qscale", "75",
                "-preset", "default",
                "-loop", "0",
                "-an",
                "-vsync", "0",
                output
            ];

        await new Promise((resolve, reject) => {
            execFile("ffmpeg", args, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // ✅ CREATE STICKER WITH METADATA
        const sticker = new Sticker(fs.readFileSync(output), {
            pack: "Created By",
            author: "Queen Nilu MD",
            type: "full",
            categories: ["🌟"],
            id: "queen-nilu-md",
            quality: 80
        });

        const stickerBuffer = await sticker.toBuffer();

        // 📤 SEND
        await conn.sendMessage(from, {
            sticker: stickerBuffer
        }, { quoted: mek });

        // 🧹 Cleanup
        fs.unlinkSync(input);
        fs.unlinkSync(output);

    } catch (err) {
        console.log(err);
        reply("❌ Error creating sticker");
    }
});

// 🎡 STICKER → IMAGE
cmd({
    pattern: "toimg",
    react: "🖼️",
    desc: "Sticker to image",
    category: "convert",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        let media = getMediaMessage(mek);
        if (!media || media.type !== "sticker") return reply("❌ Reply to sticker");

        const buffer = await downloadMediaMessage(
            media,
            "buffer",
            {},
            {
                logger: conn.logger,
                reuploadRequest: conn.updateMediaMessage
            }
        );

        const input = path.join(tempDir, `st_${Date.now()}.webp`);
        const output = path.join(tempDir, `img_${Date.now()}.png`);

        fs.writeFileSync(input, buffer);

        await new Promise((resolve, reject) => {
            execFile("ffmpeg", ["-i", input, output], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        await conn.sendMessage(from, {
            image: fs.readFileSync(output),
            caption: "✅ Converted"
        }, { quoted: mek });

        fs.unlinkSync(input);
        fs.unlinkSync(output);

    } catch (e) {
        reply("❌ Error converting");
    }
});

module.exports = {};
