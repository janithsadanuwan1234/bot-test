const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    // 🔑 Essential Session & Owner Settings
    OWNER_NUMBER: process.env.OWNER_NUMBER || "94788175828",

    // 🤖 Default Fallback Settings
    DEFAULT_BOT_NAME: process.env.DEFAULT_BOT_NAME || "QUEEN-NILU-MD",
    DEFAULT_OWNER_NAME: process.env.DEFAULT_OWNER_NAME || "Janith Sadanuwan",
    DEFAULT_PREFIX: process.env.DEFAULT_PREFIX || ".",

    // 🖼️ Media Settings (Alive image & Menu)
    ALIVE_IMG: process.env.ALIVE_IMG || "https://telegra.ph/file/1e63f0ee90304a12767c7.jpg",
    MENU_IMG: process.env.MENU_IMG || "https://telegra.ph/file/1e63f0ee90304a12767c7.jpg",

    // ⚙️ Dashboard / Database Defaults
    // මෙම අගයන් පළමු වතාවට Database එක සෑදීමේදී භාවිත වේ (Database & Dashboard Sync)
    AUTO_READ: process.env.AUTO_READ || "false",
    AUTO_TYPING: process.env.AUTO_TYPING || "false",
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "false",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
    READ_CMD: process.env.READ_CMD || "false",
    AUTO_VOICE: process.env.AUTO_VOICE || "false",
    TIMEZONE:process.env.TIMEZONE || "Asia/Colombo",
};
