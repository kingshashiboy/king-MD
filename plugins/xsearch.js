// x-search plugin (video & image)

cmd({
  pattern: "xsearch",
  alias: ["xvid", "ximg"],
  desc: "Search X videos and images by keyword",
  react: "🔍",
  category: "tool",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a keyword to search.");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // Example API (XSearch API) - you can replace with any working API
    const apiUrl = `https://apiskeith.vercel.app/search/searchxvideos?q=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.status || !data.result || data.result.length === 0) {
      return reply("⚠️ No results found. Try another keyword.");
    }

    // Send top 1 result (can loop to send multiple)
    const result = data.result[0];
    const { title, type, thumb, link, views, uploaded } = result;

    const caption = `╭═══ 〔 *X SEARCH* 〕═══❐
┃ 🔖 *Title:* ${title || "Unknown"}
┃ 📂 *Type:* ${type || "Unknown"}
┃ 👀 *Views:* ${views || "Unknown"}
┃ 📅 *Uploaded:* ${uploaded || "Unknown"}
╰══════════════════❐
> Link: ${link || "N/A"}
`;

    // If video, send video; if image, send image
    if (type === "video") {
      await conn.sendMessage(from, {
        video: { url: link || thumb },
        caption: caption
      }, { quoted: m });
    } else {
      await conn.sendMessage(from, {
        image: { url: thumb || link },
        caption: caption
      }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while searching. Try again.");
  }
});
