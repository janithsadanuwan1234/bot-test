const { cmd } = require("../command.cjs");
const axios = require("axios");

cmd({
    pattern: "ai",
    alias: ["deepai"],
    react: "🤖",
    desc: "Chat with DeepAI (QUEEN-NILU-MD AI).",
    category: "tools",
    filename: __filename
}, async (bot, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🤖 *Hello! I am QUEEN-NILU-MD AI. How can I help you today?*\n\nExample: .ai Write a short poem about Sri Lanka.");

        await bot.sendMessage(from, { react: { text: "🧠", key: m.key } });

        const API_URL = `https://zanta-api.vercel.app/api/deepchat?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(API_URL);

        if (!data.status || !data.result) {
            return reply("❌ AI සේවාව මේ වෙලාවේ කාර්යබහුලයි. පසුව උත්සාහ කරන්න.");
        }

        const aiResponse = data.result; 

        let finalMsg = `${aiResponse}`;
        await bot.sendMessage(from, {
            text: finalMsg,

        }, { quoted: mek });
      
        await bot.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("AI Error:", e);
        reply("❌ AI Error: " + (e.response ? e.response.data.details : e.message));
    }
});
