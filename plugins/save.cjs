const { cmd } = require("../command.cjs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// 🖼️ SAVE View Once Image/Video Command
cmd(
{
    pattern: "save",
    react: "💾",
    desc: "Saves View Once image or video safely.",
    category: "media",
    filename: __filename,
},
async (nilu, mek, m, { from, reply }) => {
    try {
        // 1. Reply පණිවිඩයක් දැයි පරීක්ෂා කිරීම
        if (!m.quoted) {
            return reply("කරුණාකර *View Once Image* හෝ *Video* පණිවිඩයක් Reply කරන්න.");
        }

        const quotedMsg = m.quoted.msg;
        
        if (!quotedMsg) {
            return reply(`❌ Reply කළ පණිවිඩයේ දත්ත සොයා ගැනීමට නොහැක.`);
        }

        // 2. View Once Message එකක්දැයි පරීක්ෂා කිරීම
        const isViewOnce = quotedMsg.viewOnce === true;

        if (!isViewOnce) {
            return reply(`මෙය *View Once* පණිවිඩයක් නොවේ. (Actual Type: ${m.quoted.type})`);
        }

        // 3. Image හෝ Video එකක්දැයි පරීක්ෂා කිරීම
        const actualMessageType = m.quoted.type;

        if (actualMessageType !== 'imageMessage' && actualMessageType !== 'videoMessage') {
            return reply("කරුණාකර *View Once Image* හෝ *Video* එකක් Reply කරන්න.");
        }

        reply("💾 View Once Media Download කරමින්...");
        await nilu.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // 4. Media Streaming (RAM එක පිරීම පාලනය කරයි)
        // මුළු ෆයිල් එකම එකපාර RAM එකට ගන්නේ නැතිව කැබලි (Chunks) විදිහට ලබා ගනී
        const mediaType = actualMessageType === 'imageMessage' ? 'image' : 'video';
        const stream = await downloadContentFromMessage(quotedMsg, mediaType);
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (!buffer || buffer.length === 0) {
            return reply("❌ Media Download කිරීමට නොහැකි විය.");
        }

        // 5. Media එක නැවත Chat එකට යැවීම
        const senderJid = m.quoted.sender;
        const captionText = `🖼️ *Saved View Once Media*\nSender: @${senderJid.split('@')[0]}`;
        
        const messageOptions = {
            [actualMessageType === 'imageMessage' ? 'image' : 'video']: buffer,
            caption: captionText,
            mentions: [senderJid]
        };

        await nilu.sendMessage(from, messageOptions, { quoted: mek });
        await nilu.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Save Command Error:", e);
        reply(`*Error:* Save කිරීමේදී දෝෂයක් සිදුවිය: ${e.message}`);
    }
});
