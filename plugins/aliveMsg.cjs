function getAliveMessage() {


    //const date = new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    //const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return `*👋🏻 {BOT_NAME} ONLINE NOW*

*╭────♡◉◉◉♡────⌬*
💖 *Hey, {pushname} ${pushwish} I’m {BOT_NAME}🙃, Alive Now for you*
*╰────♡◉◉◉♡────⌬*


*📅 ᴅᴀᴛᴇ: {DATE}*
*⌚ ᴛɪᴍᴇ: {TIME}*
*📱 ɴᴜᴍʙᴇʀ: {OWNER_NUMBER}*
*💬 ᴘʀᴇꜰɪx: {PREFIX}*

*───────────────*
*🌐 ᴄᴏɴᴛᴀᴄᴛ ᴊᴀɴɪʏᴀ*
> http://wa.me/+94788175828?text=*Hey__JANIYA*
`;
}

module.exports = { getAliveMessage };
