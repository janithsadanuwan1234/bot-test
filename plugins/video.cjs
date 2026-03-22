const { cmd } = require("../command.cjs");
const axios = require("axios");
const yts = require("yt-search");

cmd({
    pattern: "video",
    alias: ["mp4", "ytv"],
    react: "🎥",
    desc: "Download YouTube Video with quality selection",
    category: "download",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎥 *Example:* .video alone");

        const search = await yts(q);
        const video = search.videos[0];
        if (!video) return reply("❌ No results found.");

        const id = video.videoId;

        let caption = `🎥 *QUEEN-NILU VIDEO PLAYER*\n\n` +
                      `📝 *Title:* ${video.title}\n` +
                      `👤 *Channel:* ${video.author.name}\n` +
                      `⏱️ *Duration:* ${video.timestamp}\n\n` +
                      `👇 *Select Quality:*`;

        // ✅ SEND BUTTON MESSAGE
        await bot.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: caption,
            footer: "> © QUEEN-NILU-MD",
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

        // ✅ BUTTON LISTENER
        const listener = async (update) => {
            const msg = update.messages[0];
            if (!msg.message) return;

            const buttonId =
                msg.message?.buttonsResponseMessage?.selectedButtonId;

            if (!buttonId) return;

            if (!buttonId.startsWith("vid_")) return;

            await bot.sendMessage(from, { react: { text: '⏳', key: msg.key } });

            const parts = buttonId.split("_");
            const quality = parts[1];
            const vidId = parts.slice(2).join("_");

            if (vidId !== id) return;

            try {
                const apiUrl = `https://sai-green.vercel.app/manump4?url=${encodeURIComponent(video.url)}&quality=${quality}`;
                const response = await axios.get(apiUrl);

                const downloadUrl = response.data.download?.url;

                if (!downloadUrl) {
                    return reply(`❌ ${quality}p link not found!`);
                }

                await bot.sendMessage(from, {
                    video: { url: downloadUrl },
                    mimetype: "video/mp4",
                    caption: `📝 ${video.title}\n✅ Quality: ${quality}p\n\n> © QUEEN-NILU-MD`
                }, { quoted: msg });

                await bot.sendMessage(from, { react: { text: '✅', key: msg.key } });

            } catch (err) {
                console.error(err);
                reply("❌ Error downloading video.");
            }

            bot.ev.off("messages.upsert", listener);
        };

        bot.ev.on("messages.upsert", listener);

        setTimeout(() => {
            bot.ev.off("messages.upsert", listener);
        }, 300000);

    } catch (e) {
        console.log("VIDEO ERROR:", e);
        reply("❌ Error: " + e.message);
    }
});
