const { cmd } = require("../command.cjs");
const axios = require("axios");
const yts = require("yt-search");
const config = require("../config.cjs");

const activeVideos = new Map(); // store video data

cmd({
    pattern: "video",
    alias: ["mp4", "ytv"],
    react: "🎥",
    desc: "Download YouTube Video with quality selection",
    category: "download",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎥 *QUEEN-NILU-MD VIDEO SEARCH*\n\nExample: .video alone");

        const search = await yts(q);
        const video = search.videos[0];
        if (!video) return reply("❌ No results found on YouTube.");

        const id = Date.now().toString(); // unique id
        activeVideos.set(id, video);

        let caption = `🎥 *QUEEN-NILU VIDEO PLAYER* 🎥\n\n` +
                      `📝 *Title:* ${video.title}\n` +
                      `👤 *Channel:* ${video.author.name}\n` +
                      `⏱️ *Duration:* ${video.timestamp}\n` +
                      `🔗 *Link:* ${video.url}\n\n` +
                      `👇 *Select Quality Below*`;

        await bot.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: caption,
            footer: "© QUEEN-NILU-MD VIDEO SERVICE",
            buttons: [
                {
                    buttonId: `vid_360_${id}`,
                    buttonText: { displayText: "📉 360p" },
                    type: 1
                },
                {
                    buttonId: `vid_480_${id}`,
                    buttonText: { displayText: "📺 480p" },
                    type: 1
                },
                {
                    buttonId: `vid_720_${id}`,
                    buttonText: { displayText: "🎬 720p HD" },
                    type: 1
                }
            ],
            headerType: 4
        }, { quoted: mek });

    } catch (e) {
        console.log("VIDEO ERROR:", e);
        reply("❌ *Error:* " + e.message);
    }
});


// ================= BUTTON HANDLER =================

cmd({
    pattern: "vid",
    fromMe: false,
    dontAddCommandList: true
}, async (bot, mek, m, { from }) => {
    try {
        const id = mek.message?.buttonsResponseMessage?.selectedButtonId;
        if (!id) return;

        const parts = id.split("_"); // vid_360_123456
        if (parts.length < 3) return;

        const quality = parts[1];
        const videoId = parts[2];

        const video = activeVideos.get(videoId);
        if (!video) {
            return bot.sendMessage(from, { text: "❌ Session expired. Please search again." }, { quoted: mek });
        }

        await bot.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        try {
            const apiUrl = `https://sai-green.vercel.app/manump4?url=${encodeURIComponent(video.url)}&quality=${quality}`;
            const response = await axios.get(apiUrl);

            const downloadUrl = response.data.download?.url;

            if (!downloadUrl) {
                return bot.sendMessage(from, { text: `❌ ${quality}p link not found!` }, { quoted: mek });
            }

            await bot.sendMessage(from, {
                video: { url: downloadUrl },
                mimetype: "video/mp4",
                caption: `📝 ${video.title}\n✅ Quality: ${quality}p\n\n> *© QUEEN-NILU-MD*`
            }, { quoted: mek });

            await bot.sendMessage(from, { react: { text: '✅', key: mek.key } });

            activeVideos.delete(videoId);

        } catch (err) {
            console.error(err);
            bot.sendMessage(from, { text: "❌ Error downloading video." }, { quoted: mek });
        }

    } catch (e) {
        console.log("BUTTON ERROR:", e);
    }
});
