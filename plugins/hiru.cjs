const { cmd } = require("../command.cjs");
const axios = require("axios");

cmd({
    pattern: "news",
    alias: ["hiru", "latestnews"],
    react: "📰",
    desc: "Get the latest breaking news from Hiru News.",
    category: "media",
    filename: __filename
}, async (bot, mek, m, { from, reply }) => {
    try {
        await bot.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const API_URL = `https://apis.sandarux.sbs/api/news/hiru?apikey=darknero`;
        const { data } = await axios.get(API_URL);

        if (!data.status || !data.results || data.results.length === 0) {
            return reply("❌ මේ වෙලාවේ පුවත් ලබා ගැනීමට නොහැක. පසුව උත්සාහ කරන්න.");
        }

        // පළමු පුවත පමණක් ලබා ගැනීම
        const latestNews = data.results[0];

        let newsCaption = `📰 *QUEEN-NILU-MD LATEST NEWS* 📰\n\n` +
                          `📌 *${latestNews.title}*\n\n` +
                          `📝 ${latestNews.description}\n\n` +
                          `🔗 *Read More:* ${latestNews.url}\n\n` +
                          `> *© QUEEN-NILU-MD NEWS SERVICE*`;

        // පුවතේ රූපය සහ විස්තරය යැවීම
        await bot.sendMessage(from, {
            image: { url: latestNews.image },
            caption: newsCaption
        }, { quoted: mek });

        await bot.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("News Error:", e);
        reply("❌ පුවත් ලබා ගැනීමේදී දෝෂයක් සිදු විය: " + e.message);
    }
});
