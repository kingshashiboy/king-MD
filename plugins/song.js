const axios = require("axios");
const { cmd } = require('../command');

module.exports = {
  name: "song",
  alias: ["yta", "music", "mp3"],
  desc: "Download YouTube song as MP3",
  category: "downloader",
  usage: "song <YouTube link or title>",
  react: "🎧",
  async exec(malvin, m, { text, prefix, command }) {
    try {
      if (!text)
        return m.reply(
          `🎶 *Usage:* ${prefix}${command} <YouTube Link>\n\n📌 Example:\n${prefix}${command} https://youtube.com/watch?v=60ItHLz5WEA`
        );

      m.reply("⏳ *Downloading your song... Please wait!*");

      const apiUrl = `https://apis.davidcyriltech.my.id/song?url=${encodeURIComponent(
        text
      )}`;

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.status || !data.result)
        return m.reply("❌ *Failed to download song. Try another link!*");

      const audioUrl = data.result;

      await malvin.sendMessage(
        m.from,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: "BlackWolf-Song.mp3",
          caption: `🎵 *Downloaded via Black Wolf Bot 🐺*\n\n📻 Source: YouTube\n🔗 ${text}`,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error(err);
      m.reply("⚠️ *Error:* Unable to fetch song. Try again later.");
    }
  },
};
