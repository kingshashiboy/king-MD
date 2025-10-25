const { cmd } = require('../command')
const axios = require('axios')
const fs = require('fs-extra')

cmd({
  pattern: "fb3",
  desc: "Facebook video downloader",
  react: "🎬",
  category: "download"
}, async (conn, m, text) => {
  try {
    if (!text) return await m.reply("🔗 *Please send a valid Facebook video link!*")

    const buttons = [
      { buttonId: `fb_sd ${text}`, buttonText: { displayText: '📱 SD VIDEO' }, type: 1 },
      { buttonId: `fb_hd ${text}`, buttonText: { displayText: '💎 HD VIDEO' }, type: 1 },
      { buttonId: `fb_audio ${text}`, buttonText: { displayText: '🎧 AUDIO' }, type: 1 },
      { buttonId: `fb_audiodoc ${text}`, buttonText: { displayText: '🎧 AUDIO DOC' }, type: 1 },
      { buttonId: `fb_vn ${text}`, buttonText: { displayText: '🎤 VOICE NOTE' }, type: 1 },
    ]

    const msg = {
      caption: `🎬 * 𝐀𝐆𝐍𝐈 FB DOWNLOADER * ❤️

💫 *URL:* ${text}

> Choose your download format below 👇`,
      footer: "🔥 𝐀𝐆𝐍𝐈 | 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧 🔥",
      buttons: buttons,
      headerType: 1
    }

    await conn.sendMessage(m.chat, msg, { quoted: m })

  } catch (e) {
    console.log(e)
    await m.reply("❌ Error creating Facebook buttons.")
  }
})


// BUTTON HANDLER SECTION
cmd({
  on: "button"
}, async (conn, m, { buttonId }) => {
  try {
    const [action, url] = buttonId.split(" ")

    await m.reply("⏳ *Downloading... Please wait!*")

    let apiURL

    // 🔗 Change these API links to your own FB APIs
    if (action === "fb_sd") apiURL = `https://apiskeith.vercel.app/download/fbdown?url=${url}`
    else if (action === "fb_hd") apiURL = `https://apiskeith.vercel.app/download/fbdown?url=${url}`
    else if (action === "fb_audio") apiURL = `https://apis.davidcyriltech.my.id/facebook3?url=${url}`
    else if (action === "fb_audiodoc") apiURL = `https://apiskeith.vercel.app/download/fbdown?url=${url}`
    else if (action === "fb_vn") apiURL = `https://apiskeith.vercel.app/download/fbdown?url=${url}`

    const res = await axios.get(apiURL)
    const dlUrl = res.data.url || res.data.result || res.data.download

    if (!dlUrl) return await m.reply("⚠️ Download link not found!")

    if (action === "fb_audio" || action === "fb_audiodoc" || action === "fb_vn") {
      await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: "✅ Download complete!" }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    await m.reply("❌ Error downloading file. API might be offline.")
  }
})
