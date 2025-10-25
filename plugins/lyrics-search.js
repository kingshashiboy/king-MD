// Lyrics Search Plugin

cmd({
  pattern: "lyrics",
  alias: ["lyric", "lyricsearch"],
  desc: "Search for song lyrics",
  react: "🎵",
  category: "tool",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a song title or lyrics snippet.");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `https://apiskeith.vercel.app/search/lyrics3?query=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.status || !data.result || data.result.length === 0) {
      return reply("⚠️ No lyrics found. Try another search.");
    }

    const result = data.result[0];
    const { title, artist, lyrics, album, release_date } = result;

    const caption = `╭═══ 〔 *Lyrics Search* 〕═══❐
┃ 🎤 *Song:* ${title}  
┃ 🎼 *Artist:* ${artist}  
┃ 📀 *Album:* ${album || "N/A"}  
┃ 📅 *Released:* ${release_date || "N/A"}  
╰══════════════════❐

*Lyrics:*
${lyrics.substring(0, 500)}...`;

    await conn.sendMessage(from, { text: caption }, { quoted: m });
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while fetching the lyrics. Please try again.");
  }
});
