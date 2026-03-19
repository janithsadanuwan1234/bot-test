const { cmd } = require("../command.cjs");
const fs = require('fs');
const path = require('path');
const figlet = require('figlet');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const config = require('../config.cjs');

ffmpeg.setFfmpegPath(ffmpegPath);

// Heroku සඳහා temp folder එක සක්‍රීය කිරීම
const tempDir = './temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const CHANNEL_JID = "120363233854483997@newsletter"; 
const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: CHANNEL_JID,
        serverMessageId: 100,
        newsletterName: "𝒁𝑨𝑵𝑻𝑨-𝑴𝑫 𝑶𝑭𝑭𝑰𝑪𝑰𝑨𝑳 </>"
    }
};

// --- 🏁 TEXT TO QR ---
cmd({
    pattern: "toqr",
    react: "🏁",
    desc: "create QR Code.",
    category: "tools",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, args }) => {
    try {
        let text = args.join(" ");
        if (!text) return reply("*වචනයක් හෝ ලින්ක් එකක් ලබාදෙන්න!* ❌");
        let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
        await zanta.sendMessage(from, { 
            image: { url: qrUrl }, 
            caption: `*QR for:* ${text}`,
            contextInfo: contextInfo 
        }, { quoted: mek });
    } catch (e) { reply("Error!"); }
});

// --- ✍️ FANCY FONTS ---
cmd({
    pattern: "fancy",
    alias: ["font", "style"],
    react: "✍️",
    desc: "Convert text into stylish fonts.",
    category: "tools",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("✍️ *වචනයක් ලබා දෙන්න.*");
        const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const styles = {
            "𝖲𝖺𝗇𝗌": "𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹𝖺𝖻𝖼𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫",
            "𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄": "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
        };

        let result = `✨ *ZANTA-MD FONTS* ✨\n\n`;
        for (let styleName in styles) {
            let styledText = "";
            let styleAlphabet = styles[styleName];
            for (let char of q) {
                let index = normalChars.indexOf(char);
                if (index !== -1) {
                    let charLength = Math.floor(styleAlphabet.length / normalChars.length);
                    styledText += styleAlphabet.substr(index * charLength, charLength).trim();
                } else styledText += char;
            }
            result += `📍 *${styleName}*\n${styledText}\n\n`;
        }
        await zanta.sendMessage(from, { text: result + `> *© ZANTA-MD*`, contextInfo: contextInfo }, { quoted: mek });
    } catch (err) { reply("❌ Error!"); }
});

// --- 🎨 ASCII ART ---
cmd({
    pattern: "art",
    react: "🎨",
    desc: "ASCII art symbols.",
    category: "tools",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q || q.length > 6) return reply("⚠️ *අකුරු 6ක් පමණක් ලබා දෙන්න.*");
        figlet(q, function(err, data) {
            if (err) return reply("❌ Error!");
            zanta.sendMessage(from, { 
                text: "```" + data + "```\n\n> *© ZANTA-MD*", 
                contextInfo: contextInfo 
            }, { quoted: mek });
        });
    } catch (err) { reply("❌ Error!"); }
});

module.exports = {};
