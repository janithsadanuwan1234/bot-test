const { cmd } = require("../command.cjs");
const axios = require("axios");

cmd({
    pattern: "paper",
    alias: ["pastpaper", "pp", "exam"],
    react: "🔎",
    desc: "Search and download past papers from Paperhub.",
    category: "download",
    filename: __filename
}, async (bot, mek, m, { from, q, reply, prefix }) => {
    try {
        if (!q) return reply(`📚 *ZANTA PAPER SEARCH*\n\nExample: \`${prefix}paper combined maths\``);

        const API_URL = `https://apis.sandarux.sbs/api/download/paperhub?apikey=darknero&q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(API_URL);

        if (!data.status || !data.results || data.results.length === 0) {
            return reply("❎ කිසිදු ප්‍රතිඵලයක් හමු නොවීය!");
        }

        const results = data.results.slice(0, 10);
        let msg = `📚 *ZANTA-MD PAPER HUB* 📚\n\n🔍 Query: *${q}*\n\n`;
        
        results.forEach((res, index) => {
            msg += `${index + 1}️⃣ *${res.title}*\n`;
        });
        
        msg += `\n> *පේපර් එක ලබා ගැනීමට අදාළ අංකය Reply කරන්න.* \n\n*© ZANTA-MD*`;

        const sentMsg = await bot.sendMessage(from, {
            image: { url: results[0].image || "https://paperhub.lk/wp-content/uploads/2022/04/paperhub_logo.png" },
            caption: msg
        }, { quoted: mek });

        // --- Reply Listener Logic (Like song.js) ---
        const listener = async (update) => {
            try {
                const msgUpdate = update.messages[0];
                if (!msgUpdate.message) return;

                const body = msgUpdate.message.conversation || 
                             msgUpdate.message.extendedTextMessage?.text;

                // පරීක්ෂාව: Reply කළේ sentMsg එකටද සහ එය අංකයක්ද කියා
                const isReplyToBot = msgUpdate.message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

                if (isReplyToBot && body && !isNaN(body)) {
                    const index = parseInt(body) - 1;
                    const selected = results[index];

                    if (selected) {
                        // Listener එක නතර කරන්න (වැඩේ පටන් ගත් නිසා)
                        bot.ev.off('messages.upsert', listener);

                        await bot.sendMessage(from, { react: { text: '⏳', key: msgUpdate.key } });

                        if (!selected.download) {
                            return reply("❌ සමාවෙන්න, මේ පේපර් එකට සෘජු ඩවුන්ලෝඩ් ලින්ක් එකක් හමු නොවීය.");
                        }

                        // [DIRECT STREAM METHOD - LOW RAM]
                        await bot.sendMessage(from, {
                            document: { url: selected.download },
                            mimetype: 'application/pdf',
                            fileName: `${selected.title.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`,
                            caption: `📄 *${selected.title}*\n\n> *© ZANTA-MD PAPER SERVICE*`
                        }, { quoted: msgUpdate });

                        await bot.sendMessage(from, { react: { text: '✅', key: msgUpdate.key } });
                    }
                }
            } catch (err) {
                console.error("Listener Error:", err);
            }
        };

        // Listener එක Register කිරීම
        bot.ev.on('messages.upsert', listener);

        // විනාඩි 5කට පසු Listener එක ඉවත් කිරීම (Timeout)
        setTimeout(() => {
            bot.ev.off('messages.upsert', listener);
        }, 300000);

    } catch (e) {
        console.error("Paperhub Error:", e);
        reply("❌ දෝෂයක් සිදු විය: " + e.message);
    }
});
