// Google Search Plugin
const { cmd } = require("../command"); // cmd function import
const axios = require("axios");

cmd({
  pattern: "gsearch",
  alias: ["google", "googlesearch"],
  desc: "Search Google by keyword",
  react: "🌐",
  category: "tool",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a keyword to search on Google.");

    // Send progress reaction
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // API call
    const apiUrl = `https://apiskeith.vercel.app/search/google?q=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.status || !data.result || data.result.length === 0) {
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
      return reply("⚠️ No results found for this keyword. Try another keyword.");
    }

    // Prepare top 5 results message
    let caption = `╭═══ 〔 *Google Search Results* 〕═══❐\n`;
    data.result.slice(0, 5).forEach((item, index) => {
      caption += `┃ ${index + 1}️⃣ *Title:* ${item.title || "N/A"}\n`;
      caption += `┃ 🔗 *Link:* ${item.link || "N/A"}\n`;
      caption += `┃ 📄 *Snippet:* ${item.snippet || "N/A"}\n`;
      caption += `╰───────────────────\n`;
    });
    caption += `> *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧*`;

    await conn.sendMessage(from, { text: caption }, { quoted: m });
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    await conn.sendMessage(from, { text: "✅ Google search results fetched successfully!" }, { quoted: m });

  } catch (error) {
    console.error(error);
    await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    reply("❌ An error occurred while searching Google. Please try again.");
  }
});
