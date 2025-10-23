const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd(
  {
    pattern: "song",
    react: "🎵",
    desc: "Download YouTube song using apiskeith API",
    category: "download",
    filename: __filename,
  },
  async (malvin, mek, m, { from, args, reply }) => {
    try {
      const q = args.join(" ");
      if (!q) return reply("🎶 *Please provide a YouTube link or song name!*");

      // 🔍 1) Get YouTube URL
      let url = q;
      try {
        url = new URL(q).toString();
      } catch {
        const search = await yts(q);
        if (!search?.videos?.length) return reply("❌ *No results found!*");
        url = search.videos[0].url;
      }

      // 🧾 2) Get video info
      const s = await yts(url);
      const info = s?.videos?.[0];
      if (!info) return reply("❌ *Failed to fetch video info!*");

      const caption = `
🎧 *BLACK WOLF SONG DOWNLOADER* 🐺

🎵 *Title:* ${info.title}
⏱️ *Duration:* ${info.timestamp}
📆 *Published:* ${info.ago}
👀 *Views:* ${info.views.toLocaleString()}
🔗 *Link:* ${info.url}

━━━━━━━━━━━━━━━
*Powered by Shashika ⚡*
      `.trim();

      await malvin.sendMessage(
        from,
        { image: { url: info.thumbnail }, caption },
        { quoted: mek }
      );

      // 🎼 3) Download audio via API
      const apiUrl = `https://apiskeith.vercel.app/download/yta2?url=${encodeURIComponent(url)}`;
      reply("⏳ *Fetching high-quality MP3... please wait!*");

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.url) {
        return reply("❌ *Failed to get download link from API!*");
      }

      const audioUrl = data.url;
      const title = info.title || "YouTube Audio";

      // 🎵 4) Send audio to user
      await malvin.sendMessage(
        from,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          caption: `🎶 *${title}*\n\nDownloaded via *BLACK WOLF BOT 🐺*`,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error("Error in song command:", e);
      reply(`❌ *Error:* ${e.message}`);
    }
  }
);
