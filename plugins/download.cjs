const { cmd } = require("../command.cjs");
const axios = require('axios');
const config = require('../config.cjs');



cmd(
  {
    pattern: "apk",
    alias: ["android", "app"],
    react: "📍",
    desc: "Download your favourite apk",
    category: "download",
    filename: __filename,
  },
  async (test, mek, m, { q, reply, from }) => {
    try {
      if (!q) return reply("❌ *Please provide an app name to search!*");

      await test.sendMessage(from, { react: { text: "⏳", key: mek.key } });

      const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`;
      const { data } = await axios.get(apiUrl);

      if (!data?.datalist?.list?.length) {
        return reply("⚠️ *No apps found with the given name.*");
      }

      const app = data.datalist.list[0];
      const appSize = (app.size / 1048576).toFixed(2);

      // සයිස් එක 400MB වලට වඩා වැඩි නම් පණිවිඩයක් දීම
      if (parseFloat(appSize) > 600) {
        return reply(`🚫 *File is too large (${appSize} MB).* Max limit is 600MB.`);
      }

      const caption = `📦 *QUEEN-NILU-MD APK DOWNLOADER* 📦\n\n` +
                      `📝 *Name:* ${app.name}\n` +
                      `🆔 *Package:* ${app.package}\n` +
                      `⚖️ *Size:* ${appSize} MB\n` +
                      `👤 *Developer:* ${app.developer.name}\n\n` +
                      `> *© QUEEN-NILU-MD APK SERVICE*`;

      // 1. ඇප් එකේ විස්තර සහ ෆොටෝ එක යැවීම
      await test.sendMessage(
        from,
        {
          image: { url: app.icon },
          caption: caption,
        },
        { quoted: mek }
      );

      // 2. APK ෆයිල් එක Streaming ක්‍රමයට ලබා ගැනීම
      const downloadUrl = app.file.path_alt || app.file.path;
      
      const response = await axios({
        method: "get",
        url: downloadUrl,
        responseType: "stream", // මෙතනින් තමයි streaming active වෙන්නේ
      });

      // 3. Document එකක් ලෙස Stream එක යැවීම
      await test.sendMessage(
        from,
        {
          document: { stream: response.data }, // Stream එක කෙලින්ම යොමු කරයි
          fileName: `${app.name}.apk`,
          mimetype: "application/vnd.android.package-archive",
          contentLength: app.size // සයිස් එක කලින් දීමෙන් වේගය වැඩි වේ
        },
        { quoted: mek }
      );

      await test.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (err) {
      console.error("❌ APK Downloader Error:", err);
      reply("❌ *An error occurred while downloading the APK. The server might be busy.*");
    }
  }
);

// 🕺 TIKTOK DOWNLOADER
cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt"],
    react: "🕺",
    category: "download",
    filename: __filename
}, async (zanta, mek, m, { from, reply, q, userSettings }) => {
    try {
        if (!q || !q.includes("tiktok.com")) return reply("❌ *වලංගු TikTok Link එකක් ලබා දෙන්න.*");

        const loading = await zanta.sendMessage(from, { text: "🔄 *පිටපත් කරමින්...*" }, { quoted: mek });

        const response = await axios.get(`https://www.tikwm.com/api/?url=${q}`);
        const videoData = response.data?.data;

        if (!videoData) return await zanta.sendMessage(from, { text: "❌ *වීඩියෝව සොයාගත නොහැකි විය.*", edit: loading.key });

        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const botName = settings.botName || config.DEFAULT_BOT_NAME || "QUEEN-NILU-MD";

        await zanta.sendMessage(from, {
            video: { url: videoData.play },
            mimetype: "video/mp4",
            caption: `👤 *Creator:* ${videoData.author.unique_id}\n📝 *Title:* ${videoData.title || 'TikTok'}\n\n> *© ${botName}*`
        }, { quoted: mek });

        await zanta.sendMessage(from, { text: "✅ *Done!*", edit: loading.key });

    } catch (e) {
        reply(`❌ *Error:* ${e.message}`);
    }
});
