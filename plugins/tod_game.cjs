const { cmd } = require("../command.cjs");
const config = require("../config.cjs"); 

// 🎯 Truth and Dare Questions/Challenges Lists (Sinhala & English mixed)
const truths = [
    "ඔබ අවසාන වරට බොරු කීවේ කුමක් ගැනද?",
    "ඔබට ජීවිතයේ නැවත කළ නොහැකි යැයි හැඟෙන නරකම දෙය කුමක්ද?",
    "ඔබ ඔබේ WhatsApp Chat එකේදී යමෙකුට යැවීමට නොහැකි වූ පණිවිඩයක් කුමක්ද?",
    "ඔබට රහසින් crush එකක් ඇති කෙනා කවුද? (Group එකේ කෙනෙක් නම් @ කරන්න.)",
    "ඔබට පාසැලේදී හෝ රැකියා ස්ථානයේදී ලැබුණු හාස්‍යජනකම දඬුවම කුමක්ද?",
    "ඔබට වෙනත් කෙනෙකුට පැවසීමට අවශ්‍ය වූ නමුත් කිසිදා නොකී දෙයක් කුමක්ද?",
    "ඔබ රහසින් Google/YouTube හි Search කර ඇති ලැජ්ජා සහගතම දෙය කුමක්ද?",
    "අද ඔයා කියපු එක දෙයක් අහෝසි කරන්න පුළුවන් නම්, ඒ මොකක්ද?",
    "ඔබ කවදා හෝ සම්බන්ධ වී ඇති විශාලතම වැරදි වැටහීම කුමක්ද?",
    "ඔබට ක්ෂණිකව ඉවත් කර ගැනීමට අවශ්‍ය එක් පුරුද්දක් නම් කරන්න."
];

const dares = [
    "ඔයාගෙ Profile Picture එක දවසක් මගෙ 4to එකක් දාගන්න😎.",
    "සිංදුවක කෑල්ලක් හය්යෙන් කියල Voice Note එකක් එවන්න🌝.",
    "මට Dialog data reload එකක් දාන්න😌.",
    "1 ඉදල 100 Type කරලා Message 100 ක් එවන්න🫵.",
    "My everything කියලා මගෙ 4to එකක් Status දාන්න🙂.",
    "Gallery යේ තියෙන පලවෙනි 4to එක දාන්න.බොරු බෑ😒.",
    "Whatsapp එකේ Chatlist එකේ screen shot එකක් එවන්න😁.",
    "මගෙ නම ඔයාගෙ about එකට දාගන්න😌.",
    "රෝස මල් 100 ක් type කරලා එවන්න ඕනේ😌🌹.",
    "මේක තමා ලේසිම dare එක.ඔයා Lukcy...මගෙ Gruop link එක gruop 5ක Shair කරල screenshot එකක් දාන්න🌝."
];

// 🎲 Random Item Selector
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

cmd(
    {
        pattern: "tod",
        react: "😈",
        desc: "Get challenge or question.",
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
            prefix = config.PREFIX || '.',
        }
    ) => {
        try {
            const input = args.join(' ').toLowerCase().trim();

            if (!input) {
                let instruction = `😈 *Truth or Dare* 😈\n\n`;
                instruction += `කරුණාකර තෝරන්න:\n`;
                instruction += `*${prefix}tod truth* - ඇත්ත කියන්න\n`;
                instruction += `*${prefix}tod dare* - අභියෝගයක් කරන්න\n`;
                return reply(instruction);
            }

            let response = '';
            let emoji = '';

            if (input.includes('truth')) {
                // Truth Command
                const randomTruth = getRandomItem(truths);
                emoji = '🤥';
                response = `**${emoji} TRUTH: ඇත්ත කියන්න**\n\n${randomTruth}\n\n*(@${m.sender.split('@')[0]} සඳහා)*`;

            } else if (input.includes('dare')) {
                // Dare Command
                const randomDare = getRandomItem(dares);
                emoji = '🔥';
                response = `**${emoji} DARE: අභියෝගය**\n\n${randomDare}\n\n*(@${m.sender.split('@')[0]} සඳහා)*`;

            } else {
                return reply(`❌ කරුණාකර 'truth' හෝ 'dare' ලෙස නිවැරදිව යවන්න. උදා: *${prefix}tod truth*`);
            }

            // Mentions ඇතුළත් කිරීමට
            const options = { 
                mentions: [m.sender] 
            };

            return zanta.sendMessage(from, { text: response, contextInfo: options }, { quoted: mek });


        } catch (err) {
            console.error("Truth or Dare Command Error:", err);
            reply("❌ Truth or Dare Command එක ක්‍රියාත්මක කිරීමේදී දෝෂයක් සිදුවිය.");
        }
    }
);
