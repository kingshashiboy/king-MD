const config = require('../config')
const l = console.log
const { cmd } = require('../command')
const yts = require('yt-search')
const fs = require('fs-extra')
const { getBuffer } = require('../lib/functions')

cmd({
    pattern: "yts",
    alias: ["ytsearch"],
    use: '.yts alan walker',
    react: "🔎",
    desc: "Search and get YouTube results with thumbnails.",
    category: "download",
    filename: __filename
}, 

async (conn, mek, m, {
    from, q, reply
}) => {
    try {
        if (!q) return reply('*🤨Please provide a search term!*\n\n_Example:_ `.yts alan walker faded`')

        // Run search
        let search = await yts(q)
        let results = search.all.slice(0, 2) // Show top 8 results

        if (results.length < 1) return reply('*No results found!*')

        // Send results one by one with thumbnail
        for (let video of results) {
            let caption = `
╭━━━━━━━━━●●►           
🎬 *${video.title}*
👤 Channel: ${video.author.name}
⏱️ Duration: ${video.timestamp}
👁️ Views: ${video.views.toLocaleString()}
📅 Uploaded: ${video.ago}
🔗 [Watch on YouTube](${video.url})
━━━━━━━━●●►AGNI
`

            try {
                await conn.sendMessage(from, {
                    image: { url: video.thumbnail },
                    caption: caption,
                }, { quoted: mek })
            } catch (err) {
                l(err)
                // fallback text if image fails
                await conn.sendMessage(from, {
                    text: caption
                }, { quoted: mek })
            }
        }

        // Optional end message
        await conn.sendMessage(from, { text: `✅ *Search completed for:* ${q}` }, { quoted: mek })

    } catch (e) {
        l(e)
        reply('*Error while fetching YouTube results!*')
    }
})
