const { cmd } = require('../command.cjs');
const { sleep } = require('../lib/functions.cjs');

// --- 🔄 Animated Message Edit Core Function ---
async function animate(zanta, from, mek, steps, finalEmoji) {
    let sent = await zanta.sendMessage(from, { text: steps[0] }, { quoted: mek });
    for (let i = 1; i < steps.length; i++) {
        await sleep(800);
        await zanta.sendMessage(from, { text: steps[i], edit: sent.key });
    }
    if (finalEmoji) {
        await zanta.sendMessage(from, { react: { text: finalEmoji, key: sent.key } });
    }
}

// 💖 LOVE COMMAND
cmd({
    pattern: "love",
    react: "💖",
    desc: "Animated love message.",
    category: "tools",
    filename: __filename
}, async (zanta, mek, m, { from, q }) => {
    const user = q.trim() || m.pushName || "User";
    const steps = [
        `Typing... 💭`,
        `Thinking about ${user}... ❤️`,
        `I love you! 💖`,
        `Always and forever. ✨`,
        `You are my everything, ${user}! 😊`
    ];
    await animate(zanta, from, mek, steps, "😘");
});

// 🔥 FIRE COMMAND
cmd({
    pattern: "fire",
    react: "🔥",
    desc: "Animated fire message.",
    category: "tools",
    filename: __filename
}, async (zanta, mek, m, { from, q }) => {
    const text = q.trim() || "ZANTA-MD ON FIRE!";
    const steps = [
        `Initiating... 🧨`,
        `[WARNING] System Overload...`,
        `🚨 ${text} 🚨`,
        `🔥🔥🔥 DANGER! 🔥🔥🔥`,
        `🤯 Mission Accomplished! 💥`
    ];
    await animate(zanta, from, mek, steps, "😎");
});

// 😔 SAD COMMAND
cmd({
    pattern: "sad",
    react: "😔",
    desc: "Animated sad message.",
    category: "tools",
    filename: __filename
}, async (zanta, mek, m, { from }) => {
    const steps = [
        `*Huh...* 💨`,
        `Feeling empty today. 🌫️`,
        `Why does it feel so heavy? 💔`,
        `I just need a moment alone... 🌧️`,
        `Today is very Sad. 😔`
    ];
    await animate(zanta, from, mek, steps, "😥");
});

// 😠 ANGRY COMMAND
cmd({
    pattern: "angry",
    react: "😡",
    desc: "Animated angry message.",
    category: "tools",
    filename: __filename
}, async (zanta, mek, m, { from, q }) => {
    const target = q.trim() || "YOU";
    const steps = [
        `Checking the logs... 🤨`,
        `I don't like this at all! 🤬`,
        `HEY ${target.toUpperCase()}! 🗣️`,
        `DON'T PUSH MY LIMITS! 💣`,
        `*Deep breath*... Calming down now. 😤`
    ];
    await animate(zanta, from, mek, steps, "💢");
});

// ⏭ LOADING COMMAND
cmd({
    pattern: "loading",
    react: "⏭",
    desc: "Loading animation effect.",
    category: "tools",
    filename: __filename
}, async (zanta, mek, m, { from, q }) => {
    const user = q.trim() || m.pushName || "User";
    const steps = [
        `🔍 Initializing ${user}...`,
        `█▒▒▒▒▒▒▒▒▒ 10%`,
        `███▒▒▒▒▒▒▒ 30%`,
        `█████▒▒▒▒▒ 50%`,
        `███████▒▒▒ 70%`,
        `█████████▒ 90%`,
        `✅ ${user} Complete! (100%)`
    ];
    await animate(zanta, from, mek, steps, "✔️");
});
