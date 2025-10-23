const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "webinfo",
    alias: ["siteinfo", "web"],
    desc: "Get website intel using GTech API", // Changed description
    category: "tool",
    react: "🕵️‍♂️", // Changed emoji to a spy/investigator
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const url = args[0];
        if (!url) return reply('🔫 *Listen up, wise guy!* You gotta give me the address of the "establishment" you wanna look into.\n\n_Example: *.webinfo https://your-rivals-front.com*_'); // dml-style prompt

        const apiKey = 'APIKEY'; // Replace with your actual API key
        const apiUrl = `https://gtech-api-xtp1.onrender.com/api/web/info?url=${encodeURIComponent(url)}&apikey=${apiKey}`;

        const { data } = await axios.get(apiUrl);

        if (!data || data.status !== "success" || !data.data) {
            return reply('🚫 *Fuggedaboutit!* Couldn\'t get the lowdown on that "joint." Double-check the address or my "contacts" might be compromised.'); // dml-style failure message
        }

        const info = data.data;

        const caption = `╭─❰ 🕵️‍♂️ 𝗧𝗵𝗲 𝗘𝘀𝘁𝗮𝗯𝗹𝗶𝘀𝗵𝗺𝗲𝗻𝘁 ❱──➤ // D-style heading
┃ 🏷️ *The Name:* ${info.title || 'Unknown Ops'} // Dml-style terms
┃ 📃 *The Cover Story:* ${info.description || 'No Official Story'}
┃ 🏢 *The Boss/Publisher:* ${info.publisher || 'Unnamed Outfit'}
┃ 🗓️ *Established On:* ${info.date || 'Undisclosed Date'}
┃ 🖼️ *Mugshot Size:* ${info.image?.size_pretty || 'No Visual Intel'}
┃ 🌍 *The Address:* ${info.url || url}
╰──────────────➤

> *POWERED BY shashika*`; // Added dml emperor branding

        // Fixed image thumbnail - you might want to change this to a more dml-style image
        const fixedImageUrl = 'https://files.catbox.moe/envb94.jpg'; // Consider replacing this with a relevant dml-style image if available
        const response = await axios.get(fixedImageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption
        }, { quoted: m });

    } catch (e) {
        console.error("Error in webinfo command:", e);
        reply(`🚨 *Fuggedaboutit! Something went sideways, boss:* ${e.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ shashika*`); // dml-style error with branding
    }
});
