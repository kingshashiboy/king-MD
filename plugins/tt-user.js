// TikTok User Posts Search Plugin

cmd({
  pattern: "ttuser",
  alias: ["tiktokuser", "ttposts"],
  desc: "Search TikTok user's posts by username",
  react: "🎵",
  category: "tool",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a TikTok username to search.");

    // Send progress reaction
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // API call
    const apiUrl = `https://apiskeith.vercel.app/search/tiktokuserposts?user=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.status || !data.result || data.result.length === 0) {
      // Error reaction + message
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
      return reply("⚠️ No TikTok posts found for this user. Check the username and try again.");
    }

    // Prepare top 5 posts message
    let caption = `╭═══ 〔 *TikTok User Posts* 〕═══❐\n`;
    data.result.slice(0, 5).forEach((post, index) => {
      caption += `┃ ${index + 1}️⃣ *Description:* ${post.desc || "N/A"}\n`;
      caption += `┃ 📹 *Video Link:* ${post.link || "N/A"}\n`;
      caption += `┃ ❤️ *Likes:* ${post.likes || "0"}\n`;
      caption += `┃ 💬 *Comments:* ${post.comments || "0"}\n`;
      caption += `╰───────────────────\n`;
    });
    caption += `> *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧*`;

    // Send results
    await conn.sendMessage(from, { text: caption }, { quoted: m });

    // Success reaction + message
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    await conn.sendMessage(from, { text: "✅ TikTok user posts fetched successfully!" }, { quoted: m });

  } catch (error) {
    console.error(error);
    // Error reaction + message
    await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    reply("❌ An error occurred while fetching TikTok user posts. Please try again.");
  }
});
