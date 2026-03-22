const { cmd } = require("../command.cjs");
const axios = require("axios");

const API_KEY = "darknero";
const BASE_API = "https://apis.sandarux.sbs/api/movie";

cmd({
    pattern: "movie2",
    alias: ["tk", "thenkiri"],
    react: "🍿",
    desc: "Search and download movies from Thenkiri.",
    category: "download",
    filename: __filename
}, async (bot, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🍿 *QUEEN-NILU MOVIE SEARCH*\n\nExample: .movie2 Night Patrol");

        // 1. Search Movies
        const searchRes = await axios.get(`${BASE_API}/thenkiri-search?apikey=${API_KEY}&q=${encodeURIComponent(q)}`).catch(() => null);
        
        if (!searchRes || !searchRes.data.status || !searchRes.data.results.length) {
            return reply("❌ කිසිදු ප්‍රතිඵලයක් හමු නොවීය.");
        }

        const results = searchRes.data.results.slice(0, 10);
        let msg = `🎬 *QUEEN-NILU MOVIE SEARCH* 🎬\n\n`;
        results.forEach((res, index) => { 
            msg += `${index + 1}️⃣ *${res.title.split('|')[0].trim()}*\n`; 
        });
        msg += `\n*Reply with the number to get download links.* \n\n> *© QUEEN-NILU-MD MOVIE SERVICE*`;

        const sentMsg = await bot.sendMessage(from, { 
            image: { url: results[0].thumbnail || "https://i.ibb.co/vz609p0/movie.jpg" }, 
            caption: msg 
        }, { quoted: mek });

        // Listener for Movie Selection
        const movieListener = async (update) => {
            try {
                const msgUpdate = update.messages[0];
                if (!msgUpdate.message) return;
                const body = msgUpdate.message.conversation || msgUpdate.message.extendedTextMessage?.text;
                const isReplyToBot = msgUpdate.message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

                if (isReplyToBot && !isNaN(body)) {
                    const index = parseInt(body) - 1;
                    const selectedMovie = results[index];
                    if (selectedMovie) {
                        bot.ev.off('messages.upsert', movieListener); // Stop listening
                        await bot.sendMessage(from, { react: { text: '⏳', key: msgUpdate.key } });

                        // 2. Get Download Links (WellaLinks etc)
                        const infoRes = await axios.get(`${BASE_API}/thenkiri/links?apikey=${API_KEY}&url=${encodeURIComponent(selectedMovie.link)}`).catch(() => null);
                        
                        if (!infoRes || !infoRes.data.status || !infoRes.data.results.length) {
                            return reply("❌ පද්ධතියේ දෝෂයකි. පසුව උත්සාහ කරන්න.");
                        }

                        const dlLinks = infoRes.data.results;
                        let infoMsg = `🎬 *${selectedMovie.title.split('|')[0].trim()}*\n\n*Available Download Servers:* \n\n`;
                        dlLinks.forEach((dl, i) => { 
                            infoMsg += `${i + 1}️⃣ ${dl.name} (${dl.type})\n`; 
                        });
                        infoMsg += `\n> *Reply with the number to start direct download.*`;

                        const infoSent = await bot.sendMessage(from, { 
                            image: { url: selectedMovie.thumbnail }, 
                            caption: infoMsg 
                        }, { quoted: msgUpdate });

                        // Listener for Quality/Server Selection
                        const dlListener = async (dlUpdate) => {
                            try {
                                const dMsg = dlUpdate.messages[0];
                                const dBody = dMsg.message?.conversation || dMsg.message?.extendedTextMessage?.text;
                                
                                if (dMsg.message?.extendedTextMessage?.contextInfo?.stanzaId === infoSent.key.id && !isNaN(dBody)) {
                                    const selectedDl = dlLinks[parseInt(dBody) - 1];
                                    
                                    if (selectedDl) {
                                        bot.ev.off('messages.upsert', dlListener);
                                        await bot.sendMessage(from, { react: { text: '📥', key: dMsg.key } });

                                        // 3. Get Final Direct Link
                                        const finalRes = await axios.get(`${BASE_API}/thenkiri-dl?apikey=${API_KEY}&url=${encodeURIComponent(selectedDl.url)}`).catch(() => null);
                                        
                                        if (!finalRes || !finalRes.data.directLink) {
                                            return reply("❌ Direct Link එක ලබා ගැනීමට නොහැකි විය.");
                                        }

                                        const directUrl = finalRes.data.directLink;
                                        const waitMsg = await reply("📥 *QUEEN-NILU-MD is uploading your movie...* \n\n*Mode:* High-Speed Direct Stream ⚡");

                                        // Send Movie as Document (Best for high quality)
                                        await bot.sendMessage(from, { 
                                            document: { url: directUrl },
                                            mimetype: 'video/mp4', 
                                            fileName: `[QUEEN-NILU-MD] ${selectedMovie.title.split('|')[0].trim()}.mp4`,
                                            caption: `🎬 *${selectedMovie.title.split('|')[0].trim()}*\n\n> *© QUEEN-NILU-MD THENKIRI DOWNLOADER*`
                                        }, { 
                                            quoted: dMsg,
                                            mediaUploadTimeoutMs: 1000 * 60 * 60 // 1 hour timeout
                                        });

                                        if (global.gc) global.gc(); // Clean RAM
                                        await bot.sendMessage(from, { delete: waitMsg.key }).catch(() => null);
                                        await bot.sendMessage(from, { react: { text: '✅', key: dMsg.key } });
                                    }
                                }
                            } catch (err) { console.error(err); }
                        };
                        bot.ev.on('messages.upsert', dlListener);
                    }
                }
            } catch (err) { console.error(err); }
        };
        bot.ev.on('messages.upsert', movieListener);

    } catch (e) {
        console.error(e);
        reply("❌ Error: " + e.message);
    }
});
