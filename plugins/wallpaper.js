// Wallpaper Download Plugin

cmd({
  pattern: "wallpaper",
  alias: ["wpdownload", "wall"],
  desc: "Download wallpapers by keyword",
  react: "🖼️",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a keyword to search wallpapers (e.g., !wallpaper car 1).");

    // Split keyword and optional page number
    let [keyword, page] = q.split(" ");
    page = page || "1";

    // Send progress reaction
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // API call
    const apiUrl = `https://apiskeith.vercel.app/download/wallpaper?text=${encodeURIComponent(keyword)}&page=${page}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.status || !data.result || data.result.length === 0) {
      // Error reaction + message
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
      return reply("⚠️ No wallpapers found for this keyword/page. Try another keyword or page.");
    }

    // Send top 3 wallpapers (customize as needed)
    for (let i = 0; i < Math.min(3, data.result.length); i++) {
      const wallpaper = data.result[i];
      await conn.sendMessage(from, {
        image: { url: wallpaper.url },
        caption: `🖼️ Wallpaper ${i + 1} for "${keyword}"\n> *Powered by Wallpaper API*`
      }, { quoted: m });
    }

    // Success reaction + message
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    await conn.sendMessage(from, { text: `✅ Wallpapers for "${keyword}" fetched successfully!` }, { quoted: m });

  } catch (error) {
    console.error(error);
    // Error reaction + message
    await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    reply("❌ An error occurred while fetching wallpapers. Please try again.");
  }
});
