// WhatsApp Group Link Search Plugin with Success/Error Messages

cmd({
  pattern: "wgroup",
  alias: ["wgsearch", "whatsappgroup"],
  desc: "Search for WhatsApp groups by keyword",
  react: "🔗",
  category: "tool",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a keyword to search for WhatsApp groups.");

    // Send progress reaction
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // API call
    const apiUrl = `https://apiskeith.vercel.app/search/whatsappgroup?q=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.status || !data.result || data.result.length === 0) {
      // Error reaction + message
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
      return reply("⚠️ No WhatsApp groups found for this keyword. Try another keyword.");
    }

    // Prepare results message
    let caption = `╭═══ 〔 *WhatsApp Groups* 〕═══❐\n`;
    data.result.slice(0, 3).forEach((group, index) => {
      caption += `┃ ${index + 1}️⃣ *Name:* ${group.name || "Unknown"}\n`;
      caption += `┃ 🔗 *Link:* ${group.link || "N/A"}\n`;
      caption += `┃ 📅 *Members:* ${group.members || "N/A"}\n`;
      caption += `╰───────────────────\n`;
    });
    caption += `> *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧*`;

    // Send results
    await conn.sendMessage(from, { text: caption }, { quoted: m });

    // Success reaction + message
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    await conn.sendMessage(from, { text: "✅ WhatsApp groups found successfully!" }, { quoted: m });

  } catch (error) {
    console.error(error);
    // Error reaction + message
    await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    reply("❌ An error occurred while searching for WhatsApp groups. Please try again.");
  }
});
