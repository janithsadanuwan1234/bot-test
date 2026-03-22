const { cmd } = require("../command.cjs");
const axios = require("axios");

const CHANNEL_JID = "120363408887211906@newsletter";
const cooldowns = new Map();
const PAIR_IMAGE = "https://telegra.ph/file/1e63f0ee90304a12767c7.jpg";

cmd({
    pattern: "pair",
    alias: ["code", "login"],
    react: "🔑",
    desc: "Get QUEEN-NILU-MD pair code (Auto-copy format).",
    category: "main",
    filename: __filename
}, async (bot, mek, m, { from, q, reply, userSettings }) => {
    try {
        if (!q) return reply("ℹ️ *Please provide your phone number.*\n*Example:* .pair 947xxxxxxxx");

        let phoneNumber = q.replace(/[^0-9]/g, '');
        
        // Cooldown Check
        if (cooldowns.has(phoneNumber)) {
            return reply("⏳ *Wait a moment!* Request already in progress.");
        }

        await bot.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // Cooldown Set (40s)
        cooldowns.set(phoneNumber, Date.now());
        setTimeout(() => cooldowns.delete(phoneNumber), 40000); 

        const pairUrl = `https://nilu-md-pair.vercel.app/api/pair?number=${phoneNumber}`;
        const response = await axios.get(pairUrl, { timeout: 30000 });

        if (response.data && response.data.code) {
            const pairCode = response.data.code;

            // 1. මුලින්ම ලස්සන විස්තර මැසේජ් එක රූපයත් එක්ක යවනවා
            let mainMsg = `✨ *𝑸𝑼𝑬𝑬𝑵 𝑵𝑰𝑳𝑼 𝑴𝑫 𝙿𝙰𝙸𝚁 𝙲𝙾𝙳𝙴* ✨\n\n` +
                          `👤 *𝙽𝚄𝙼𝙱𝙴𝚁:* ${phoneNumber}\n` +
                          `🔑 *𝚂𝚃𝙰𝚃𝚄𝚂:* Generated Successfully\n\n` +
                          `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ǫᴜᴇᴇɴ-ɴɪʟᴜ-ᴍᴅ*`;

            const contextInfo = {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: CHANNEL_JID,
                    serverMessageId: 100,
                    newsletterName: "𝑸𝑼𝑬𝑬𝑵 𝑵𝑰𝑳𝑼 𝑴𝑫 </>"
                }
            };

            await bot.sendMessage(from, { 
                image: { url: PAIR_IMAGE }, 
                caption: mainMsg,
                contextInfo 
            }, { quoted: mek });

            // 2. දැන් කෝඩ් එක විතරක් වෙනම මැසේජ් එකක් විදිහට යවනවා (Mono-space format එකෙන්)
            // මේ කෝඩ් එක උඩ ටච් කරපු ගමන් මුළු කෝඩ් එකම කොපි වෙනවා
            await bot.sendMessage(from, { text: `${pairCode}` });

            await bot.sendMessage(from, { react: { text: '✅', key: mek.key } });

        } else {
            throw new Error("Invalid response");
        }

    } catch (e) {
        cooldowns.delete(phoneNumber);
        console.error("Pair Error:", e.message);
        reply("❌ *Error:* සර්වර් එකෙන් කෝඩ් එක ලබාගත නොහැකි විය. පසුව උත්සාහ කරන්න.");
    }
});
