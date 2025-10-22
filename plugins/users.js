const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "users",
    alias: ["allusers", "userlist"],
    desc: "Shows all users of the bot (Owner Only)",
    category: "owner",
    react: "👥",
    filename: __filename,
    owner: true // ensures this command only works for owner
}, async (conn, mek, m, { from, sender, reply }) => {

    // Check if sender is the owner
    if (!config.OWNER_NUMBER.includes(sender.split("@")[0])) {
        return reply("❌ This command is for the bot owner only.");
    }

    // Get all chats
    const allChats = Object.keys(conn.chats || {});
    const totalUsers = allChats.length;

    let userList = `╭───「 👥 *Bot Users List* 👥 」\n`;
    userList += `│ Total Users: ${totalUsers}\n│\n`;

    // List users
    allChats.forEach((jid, index) => {
        const userNumber = jid.split("@")[0];
        userList += `│ ${index + 1}. ${userNumber}\n`;
    });

    userList += `╰───────────────────────────╯`;

    await conn.sendMessage(from, { text: userList }, { quoted: mek });
});
