const { cmd } = require("../command.cjs");
const axios = require("axios");

cmd({
    pattern: "genimg",
    alias: ["animegen", "zonerai"],
    react: "🌸",
    desc: "Generate beautiful anime images using Zoner AI.",
    category: "media",
    filename: __filename
}, async (bot, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🌸 *කරුණාකර Anime රූපය ඇඳීමට අවශ්‍ය විස්තරය (Prompt) ලබා දෙන්න!* \n\nExample: .animeai beautiful anime girl in a garden");

        await bot.sendMessage(from, { react: { text: "🎨", key: m.key } });
        await reply("✨ *Generating your Anime Image... Please wait.*");

        const API_URL = `https://apis.sandarux.sbs/api/maker/zonerai?apikey=darknero&prompt=${encodeURIComponent(q)}`;

        // API එකෙන් Image එක Buffer එකක් විදියට ලබා ගැනීම
        const response = await axios.get(API_URL, {
            responseType: "arraybuffer",
            timeout: 120000 // විනාඩි 2ක timeout එකක්
        });

        const animeBuffer = Buffer.from(response.data);

        // රූපය යැවීම (With Newsletter Branding)
        await bot.sendMessage(from, {
            image: animeBuffer,
            caption: `🌸 *ZONER AI - ANIME GENERATOR* 🌸\n\n✨ *Prompt:* ${q}\n\n> *© 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝑩𝒚 𝒁𝑨𝑵𝑻𝑨-𝑴𝑫*`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363408887211906@newsletter',
                    serverMessageId: 100,
                    newsletterName: "𝑸𝑼𝑬𝑬𝑵 𝑵𝑰𝑳𝑼 𝑴𝑫"
                }
            }
        }, { quoted: mek });

        await bot.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("Anime AI Error:", e);
        await bot.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ රූපය උත්පාදනය කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    }
});
