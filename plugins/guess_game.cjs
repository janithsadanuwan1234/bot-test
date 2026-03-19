const { cmd } = require("../command.cjs");
const config = require("../config"); 

// 🎯 Memory Map for Game State (සෑම Chat එකකටම වෙනම Game එකක්)
const activeGames = new Map();

cmd(
    {
        pattern: "guess",
        react: "🎲",
        desc: "Number guessing game (1-100)",
        category: "tools",
        filename: __filename,
    },
    async (
        zanta,
        mek,
        m,
        {
            from,
            reply,
            args,
            // 🚨 FIX: prefix එක ලබා ගැනීමේදී Default Prefix එකට Fallback කිරීම.
            prefix = config.PREFIX || '.', // config.PREFIX හෝ Default '.' භාවිතා කරයි.
        }
    ) => {
        try {
            const chatID = from;

            // 🚨 FIX: args[0] ලෙස නොව, සියලු args එකතු කර trim කර ගන්න.
            // උදාහරණ: .guess start හෝ .guess 50
            const input = args.join(' ').trim();
            const commandOrGuess = input.toLowerCase(); // start, end, හෝ අනුමාන අංකය

            const numGuess = parseInt(commandOrGuess); // අංකයක් දැයි පරීක්ෂා කිරීමට

            // 1. 🛑 Game එක අවසන් කිරීම
            if (commandOrGuess === 'end') {
                if (activeGames.has(chatID)) {
                    const game = activeGames.get(chatID);
                    activeGames.delete(chatID);
                    return reply(`🎲 Game අවසන් කළා! නිවැරදි ඉලක්කම වූයේ *${game.targetNumber}* යි.`);
                }
                return reply(`❌ දැනට මෙම Chat එකේ කිසිදු Game එකක් ක්‍රියාත්මක නැහැ. ${prefix}guess start ලෙස යවා අරඹන්න.`);
            }

            // 2. ▶️ Game එක ආරම්භ කිරීම
            if (commandOrGuess === 'start' || commandOrGuess === '') { // .guess ලෙස යැවූ විටත් start කිරීමට
                if (activeGames.has(chatID)) {
                    const game = activeGames.get(chatID);
                    return reply(`⚠️ දැනටමත් Game එකක් ක්‍රියාත්මකයි! ඉතිරි අවස්ථා: ${game.attemptsLeft}. \nඔබට අංකයක් *${game.min}* සහ *${game.max}* අතර යැවිය හැක. Game එක නවත්වන්න: *${prefix}guess end*`);
                }

                const min = 1;
                const max = 100;
                const targetNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                const maxAttempts = 7; 

                const newGame = {
                    targetNumber: targetNumber,
                    attemptsLeft: maxAttempts,
                    min: min,
                    max: max,
                    owner: m.sender 
                };

                activeGames.set(chatID, newGame);

                let startMessage = `🎉 *Number Guessing Game Started!* 🎉\n\n`;
                startMessage += `මම *${min}* සහ *${max}* අතර ඉලක්කමක් තෝරා ගත්තා.\n`;
                startMessage += `ඔබට එය සොයා ගැනීමට *${maxAttempts}* අවස්ථා තිබෙනවා.\n`;
                startMessage += `දැන් ඔබගේ අනුමානය යවන්න! (උදා: *${prefix}guess 50*)\n\n`;
                startMessage += `Game එක නවත්වන්න: *${prefix}guess end*`;

                return reply(startMessage);
            }

            // 3. 🔍 අනුමානය පරීක්ෂා කිරීම (අංකයක් යැවූ විට)

            if (isNaN(numGuess)) {
                return reply(`⚠️ වලංගු command එකක් හෝ අංකයක් යවන්න. උදා: *${prefix}guess 50*`);
            }

            if (!activeGames.has(chatID)) {
                return reply(`❌ Game එකක් ක්‍රියාත්මක නැහැ. *${prefix}guess start* ලෙස යවා අරඹන්න.`);
            }

            const game = activeGames.get(chatID);

            if (numGuess < game.min || numGuess > game.max) {
                return reply(`⚠️ කරුණාකර *${game.min}* සහ *${game.max}* අතර වලංගු ඉලක්කමක් පමණක් යවන්න.`);
            }

            game.attemptsLeft--; // අවස්ථාවක් අඩු කිරීම

            if (numGuess === game.targetNumber) {
                // ✅ ජයග්‍රහණය
                activeGames.delete(chatID);
                let winMessage = `🏆 *CONGRATULATIONS!* 🏆\n`;
                winMessage += `ඔබ නිවැරදි ඉලක්කම (*${numGuess}*) සොයා ගත්තා!\n`;
                winMessage += `ඉතිරි අවස්ථා: ${game.attemptsLeft}`;
                return reply(winMessage);

            } else if (game.attemptsLeft <= 0) {
                // ❌ පරාජය
                activeGames.delete(chatID);
                let loseMessage = `💔 *GAME OVER!* 💔\n`;
                loseMessage += `ඔබගේ සියලු අවස්ථා (0) අවසන්! \n`;
                loseMessage += `නිවැරදි ඉලක්කම වූයේ: *${game.targetNumber}* යි.`;
                return reply(loseMessage);

            } else {
                // ➡️ ඉඟි ලබා දීම
                let hint = ``;
                if (numGuess < game.targetNumber) {
                    hint = `👆 *Too Low!* Try a higher number.`;
                } else {
                    hint = `👇 *Too High!* Try a lower number.`;
                }

                let continueMessage = `${hint}\n`;
                continueMessage += `ඉතිරි අවස්ථා: *${game.attemptsLeft}*\n`;

                return reply(continueMessage);
            }

        } catch (err) {
            console.error("Guess Game Command Error:", err);
            reply("❌ Game එක ක්‍රියාත්මක කිරීමේදී දෝෂයක් සිදුවිය.");
        }
    }
);
