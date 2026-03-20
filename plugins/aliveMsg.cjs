function getAliveMessage() {

const moment = require("moment-timezone")
const time2 = moment().tz("Asia/Colombo").format("HH:mm:ss");
    //const date = new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    //const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
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
    return `*👋🏻 {BOT_NAME} ONLINE NOW*

*╭────♡◉◉◉♡────⌬*
💖 Hey, *{pushname}* ${pushwish} I’m {BOT_NAME} 🙃,
 Alive Now for you
*╰────♡◉◉◉♡────⌬*


*📅 ᴅᴀᴛᴇ: {DATE}*
*⌚ ᴛɪᴍᴇ: {TIME}*
*📱 ɴᴜᴍʙᴇʀ: {OWNER_NUMBER}*
*💬 ᴘʀᴇꜰɪx: {PREFIX}*

*───────────────*
*🌐 ᴄᴏɴᴛᴀᴄᴛ ᴊᴀɴɪʏᴀ*
> http://wa.me/+94788175828?text=*Hey__JANIYA*`;
}

module.exports = { getAliveMessage };
