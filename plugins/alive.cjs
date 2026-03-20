const { cmd, commands } = require('../command.cjs');
const config = require('../config.cjs');
const aliveMsg = require('./aliveMsg.cjs');
const axios = require('axios'); 

const CHANNEL_JID = "120363408887211906@newsletter"; 

// --- 🖼️ IMAGE PRE-LOAD LOGIC ---
let cachedAliveImage = null;

async function preLoadAliveImage() {
    try {
        // මෙතනදී config එකේ තියෙන default image එක cache කරගන්නවා
        const imageUrl = config.ALIVE_IMG || "https://telegra.ph/file/1e63f0ee90304a12767c7.jpg";
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        cachedAliveImage = Buffer.from(response.data);
        console.log("✅ [CACHE] Alive image pre-loaded successfully.");
    } catch (e) {
        console.error("❌ [CACHE] Failed to pre-load alive image:", e.message);
        cachedAliveImage = null; 
    }
}

preLoadAliveImage();

cmd({
    pattern: "alive",
    react: "🤖",
    desc: "Check if the bot is online.",
    category: "main",
    filename: __filename
},
async (zanta, mek, m, { from, reply,q, userSettings }) => {
    try {
        const moment = require("moment-timezone")
 const time = moment(moment())
                    .format('HH:mm:ss')
                moment.tz.setDefault(config.TIMEZONE)
                    .locale('id')
                const date = moment.tz(config.TIMEZONE).format('DD/MM/YYYY')


   

const time2 = moment().tz("Asia/Colombo").format("HH:mm:ss");
const pushwish = "";

if (time2 < "05:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "11:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "15:00:00") {
  pushwish = `Good Afternoon 🌅`;
} else if (time2 < "18:00:00") {
  pushwish = `Good Evening 🌃`;
} else if (time2 < "19:00:00") {
  pushwish = `Good Evening 🌃`;
} else {
  pushwish = `Good Night 🌌`;
}

        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const botName = settings.botName || config.DEFAULT_BOT_NAME || "QUEEN-NILU-MD";
        const prefix = settings.prefix || config.DEFAULT_PREFIX || ".";
        const isButtonsOn = settings.buttons === 'true';
         const user = q.trim() || m.pushName || "User";
        // Placeholder replace කිරීම
        const finalMsg = aliveMsg.getAliveMessage()
            .replace(/{BOT_NAME}/g, botName)
            .replace(/{OWNER_NUMBER}/g, config.OWNER_NUMBER)
            .replace(/{pushname}/g,user)
            .replace(/{pushwish}/g,pushwish)
            .replace(/{DATE}/g,date)
            .replace(/{TIME}/g,time)
            .replace(/{PREFIX}/g, prefix);

        try {
            const aliveVoiceUrl = 'https://github.com/Dragonxjanith/UPLOADS/raw/main/VOICE/alive.mp3'; 
            const vResponse = await axios.get(aliveVoiceUrl, { responseType: 'arraybuffer' });
            const vBuffer = Buffer.from(vResponse.data, 'utf-8');

            // voice එක ගිහින් ඉවර වෙනකම් await එකෙන් ඉන්නවා
            await zanta.sendMessage(from, { 
                audio: vBuffer, 
                mimetype: 'audio/mpeg', 
                ptt: false, 
                fileName: 'Alive.mp3'
            }, { quoted: mek });

        } catch (voiceError) {
            console.error("[ALIVE VOICE ERROR]", voiceError.message);
        }                                                                                                            

        // --- 🖼️ IMAGE LOGIC: DB එකේ තියෙන එක මුලින් බලනවා, නැතිනම් Cache/Config පාවිච්චි කරනවා ---
        let imageToDisplay;
        if (settings.botImage && settings.botImage !== "null" && settings.botImage.startsWith("http")) {
            imageToDisplay = { url: settings.botImage };
        } else {
            imageToDisplay = cachedAliveImage || { url: config.ALIVE_IMG };
        }

        if (isButtonsOn) {
            // --- 🔵 BUTTONS ON MODE ---
            return await zanta.sendMessage(from, {
                image: imageToDisplay, 
                caption: finalMsg,
                footer: `© ᴘᴏᴡᴇʀᴅ ʙʏ  ɴɪʟᴜ-ᴍᴅ`,
                buttons: [
                    { buttonId: prefix + "ping", buttonText: { displayText: "⚡ PING" }, type: 1 },
                    { buttonId: prefix + "menu", buttonText: { displayText: "📜 MENU" }, type: 1 },
                    { buttonId: prefix + "settings", buttonText: { displayText: "⚙️ SETTINGS" }, type: 1 },
                    { buttonId: prefix + "help", buttonText: { displayText: "📞 HELP" }, type: 1 }
                ],
                headerType: 4, 
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,                                                                                          
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: CHANNEL_JID,
                        serverMessageId: 100,
                        newsletterName: "𝑸𝑼𝑬𝑬𝑵 𝑵𝑰𝑳𝑼 𝑴𝑫 </>"
                    }
                }
            }, { quoted: mek });

        } else {
            // --- 🟢 BUTTONS OFF MODE ---
            return await zanta.sendMessage(from, {
                image: imageToDisplay,
                caption: finalMsg,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: CHANNEL_JID,
                        serverMessageId: 100,
                        newsletterName: "𝑸𝑼𝑬𝑬𝑵 𝑵𝑰𝑳𝑼 𝑴𝑫 </>"
                    }
                }
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("[ALIVE ERROR]", e);
        reply(`❌ Error: ${e.message}`);
    }
});
