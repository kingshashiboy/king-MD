const { cmd } = require("../command");
const axios = require('axios')
const { sms } = require('../lib/msg')
// ඔබේ msg.js

module.exports = {
    pattern: 'pinterest',
    alias: ['pin', 'pinterestsearch'],
    desc: 'Search images on Pinterest',
    category: "tool",
    filename: __filename,
    async function(conn, m, store) {
        try {
            // message එකෙන් search query ගන්නවා
            let query = m.body || m.text
            if (!query) return m.reply('❌ Search term එකක් දාලා බලන්න!')

            // API call
            const url = `https://lance-frank-asta.onrender.com/api/pinterest?text=${encodeURIComponent(query)}`
            const res = await axios.get(url)
            if (!res.data || !res.data.result || res.data.result.length === 0)
                return m.reply('❌ Pinterest එකෙන් image එකක් හමුවුනේ නැහැ.')

            // ප්‍රථම image එක select කරනවා
            const image = res.data.result[0]

            // WhatsApp message එක compose කරනවා
            const caption = `📌 Pinterest Search Result\n\nTitle: ${image.title || 'N/A'}\nLink: ${image.link}`

            await conn.sendMessage(m.chat, {
                image: { url: image.media || image.link },
                caption: caption
            }, { quoted: m })

        } catch (err) {
            console.log('Pinterest Error:', err)
            m.reply('❌ Error එකක් උනා Pinterest search එකේදී.')
        }
    }
        }
