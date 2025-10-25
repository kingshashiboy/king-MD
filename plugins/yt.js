const { cmd } = require('../command')
const axios = require('axios')
const yts = require('yt-search')

cmd({
  pattern: "yt",
  desc: "Download YouTube videos or songs",
  react: "🎵",
  category: "downloade"
}, async (conn, m, text) => {
  try {
    if (!text) return await m.reply("🎬 *Send a YouTube link or song name!*")

    let videoUrl = text
    let title = ""

    // ✅ If user typed a song name, search on YouTube
    if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
      let search = await yts(text)
      if (!search.videos.length) return await m.reply("❌ No video found!")
      let vid = search.videos[0]
      videoUrl = vid.url
      title = vid.title
    }

    // Buttons for different formats
    const buttons = [
      { buttonId: `yt_sd ${videoUrl}`, buttonText: { displayText: '📱 SD VIDEO' }, type: 1 },
      { buttonId: `yt_hd ${videoUrl}`, buttonText: { displayText: '💎 HD VIDEO' }, type: 1 },
      { buttonId: `yt_audio ${videoUrl}`, buttonText: { displayText: '🎧 AUDIO' }, type: 1 },
      { buttonId: `yt_audiodoc ${videoUrl}`, buttonText: { displayText: '🎧 AUDIO DOC' }, type: 1 },
      { buttonId: `yt_vn ${videoUrl}`, buttonText: { displayText: '🎤 VOICE NOTE' }, type: 1 },
      { buttonId: `yt_videodoc ${videoUrl}`, buttonText: { displayText: '🎧 VIDEO DOC' }, type: 1 },
    ]

    const msg = {
      caption: `🎬 *𝐀𝐆𝐍𝐈 YT DOWNLOADER* ❤️

🎵 *Title:* ${title || "YouTube Video"}
🔗 *URL:* ${videoUrl}

> Choose your download format 👇`,
      footer: "🔥 𝐀𝐆𝐍𝐈 | 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧 🔥",
      buttons: buttons,
      headerType: 1
    }

    await conn.sendMessage(m.chat, msg, { quoted: m })

  } catch (e) {
    console.log(e)
    await m.reply("❌ Error while processing YouTube downloader.")
  }
})


// BUTTON HANDLER SECTION
cmd({
  on: "button"
}, async (conn, m, { buttonId }) => {
  try {
    const [action, url] = buttonId.split(" ")

    await m.reply("⏳ *Downloading from YouTube... Please wait!*")

    let apiURL

    // ✅ Replace these API endpoints with working ones (like savefrom, keithapi, etc)
    if (action === "yt_sd") apiURL = `https://api-keith.vercel.app/download/yta?url=${url}`
    else if (action === "yt_hd") apiURL = `https://apiskeith.vercel.app/download/dlmp4?url=${url}`
    else if (action === "yt_audio") apiURL = `https://apiskeith.vercel.app/download/dlmp3?url=${url}`
    else if (action === "yt_audiodoc") apiURL = `https://apiskeith.vercel.app/download/ytmp3?url=${url}`
    else if (action === "yt_vn") apiURL = `https://api-keith.vercel.app/download/yta2?url=${url}`
    else if (action === "yt_videodoc") apiURL = `https://apiskeith.vercel.app/download/ytmp4?url=${url}`

    const res = await axios.get(apiURL)
    const dlUrl = res.data.result || res.data.url || res.data.download

    if (!dlUrl) return await m.reply("⚠️ Download link not found!")

    if (action.includes("audio")) {
      await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: "✅ Download complete!" }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    await m.reply("❌ Error downloading YouTube file.")
  }
})
