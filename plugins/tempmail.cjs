const { cmd } = require("../command.cjs");
const axios = require("axios");

cmd({
    pattern: "tempmail",
    alias: ["tmail", "mail"],
    react: "📧",
    desc: "Generate a temporary email address.",
    category: "tools",
    filename: __filename
}, async (bot, mek, m, { from, reply }) => {
    try {
        await bot.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const API_URL = `https://apis.sandarux.sbs/api/tools/tempmail?apikey=darknero`;
        const { data } = await axios.get(API_URL);

        // මෙතන 'success' සහ 'data.result.email' චෙක් කරන්න
        if (!data.success || !data.result || !data.result.email) {
            return reply("❌ ඊමේල් ලිපිනයක් ජෙනරේට් කිරීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        const tempEmail = data.result.email; // ඊමේල් එක මෙතන තියෙන්නේ

        let mailMsg = `📧 *QUEEN-NILU-MD TEMP MAIL* 📧\n\n` +
                      `📍 *Email:* \`${tempEmail}\` \n\n` + // Copy කරගන්න ලේසි වෙන්න code format එකට දැම්මා
                      `> *Note:* Use this email for temporary registrations.\n\n` +
                      `*© QUEEN-NILU-MD TOOLS SERVICE*`;

        await bot.sendMessage(from, {
            text: mailMsg,
        }, { quoted: mek });

        await bot.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("TempMail Error:", e);
        reply("❌ දෝෂයක් සිදු විය: " + e.message);
    }
});
