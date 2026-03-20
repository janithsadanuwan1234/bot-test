function getAliveMessage() {
    const config = require('../config.cjs');
const moment = require("moment-timezone")
 const time = moment(moment())
                    .format('HH:mm:ss')
                moment.tz.setDefault(config.TIMEZONE)
                    .locale('id')
                const date = moment.tz(config.TIMEZONE).format('DD/MM/YYYY')

                const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();

    const day = Math.floor(uptime / (24 * 3600)); // Calculate days
const hours = Math.floor((uptime % (24 * 3600)) / 3600); // Calculate hours
const minutes = Math.floor((uptime % 3600) / 60); // Calculate minutes
const seconds = Math.floor(uptime % 60); // Calculate seconds

// Uptime
const uptimeMessage = `*I am alive now since ${day}d ${hours}h ${minutes}m ${seconds}s*`;
const runMessage = `*☀️ ${day} Day*\n*🕐 ${hours} Hour*\n*⏰ ${minutes} Minutes*\n*⏱️ ${seconds} Seconds*\n`;

const xtime = moment.tz("Asia/Colombo").format("HH:mm:ss");
const xdate = moment.tz("Asia/Colombo").format("DD/MM/YYYY");
const time2 = moment().tz("Asia/Colombo").format("HH:mm:ss");
let pushwish = "";

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

    //const date = new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    //const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return `*👋🏻 {BOT_NAME} ONLINE NOW*

*╭────♡◉◉◉♡────⌬*
💖 *Hey, {pushname} ${pushwish} I’m {BOT_NAME}🙃, Alive Now for you*
*╰────♡◉◉◉♡────⌬*


*📅 ᴅᴀᴛᴇ: ${date}*
*⌚ ᴛɪᴍᴇ: ${time}*
*📱 ɴᴜᴍʙᴇʀ: {OWNER_NUMBER}*
*💬 ᴘʀᴇꜰɪx: {PREFIX}*

*───────────────*
*🌐 ᴄᴏɴᴛᴀᴄᴛ ᴊᴀɴɪʏᴀ*
> http://wa.me/+94788175828?text=*Hey__JANIYA*
`;
}

module.exports = { getAliveMessage };
