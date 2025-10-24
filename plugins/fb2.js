const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "fb3",
    alias: ["facebook3"],
    desc: "Download Facebook videos",
    category: "download",
    filename: __filename
}, async (conn, m, store, { from, quoted, args, q, reply }) => {
    try {
        if (!q || !q.startsWith("https://")) {
            return conn.sendMessage(from, { text: "*❌ Need a valid URL*" }, { quoted: m });
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // ✅ API call to your external FB downloader API
        const apiRes = await axios.get(`https://apiskeith.vercel.app/download/fbdown?url=${encodeURIComponent(q)}`);
        const fbData = apiRes.data;

        if (!fbData.success) return reply("❌ Unable to fetch video from the URL.");

        const caption = `╭━━━〔 *FACEBOOK DOWNLOAD* 〕━━━⊷\n`
            + `┃▸ *Duration*: ${fbData.result.duration || 'N/A'}\n`
            + `╰━━━⪼\n\n`
            + `🌐 *Download Options:*\n`
            + `1️⃣ SD Quality\n`
            + `2️⃣ HD Quality\n`
            + `🎵 Audio\n`
            + `4️⃣ Document\n`
            + `5️⃣ Voice\n\n`
            + `↪️ Reply with the number to download your choice.`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: fbData.result.thumbnail },
            caption
        }, { quoted: m });

        const messageID = sentMsg.key.id;

        // Listen for reply to this message
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (!isReplyToBot) return;

            await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

            const videoLinks = fbData.result.links; // { SD: "", HD: "" }

            switch (receivedText) {
                case "1": // SD
                    await conn.sendMessage(senderID, {
                        video: { url: videoLinks.SD },
                        caption: "📥 Downloaded in SD Quality"
                    }, { quoted: receivedMsg });
                    break;

                case "2": // HD
                    await conn.sendMessage(senderID, {
                        video: { url: videoLinks.HD },
                        caption: "📥 Downloaded in HD Quality"
                    }, { quoted: receivedMsg });
                    break;

                case "3": // Audio
                    await conn.sendMessage(senderID, {
                        audio: { url: videoLinks.SD },
                        mimetype: "audio/mpeg"
                    }, { quoted: receivedMsg });
                    break;

                case "4": // Document
                    await conn.sendMessage(senderID, {
                        document: { url: videoLinks.SD },
                        mimetype: "audio/mpeg",
                        fileName: "Facebook_Audio.mp3",
                        caption: "📥 Audio Downloaded as Document"
                    }, { quoted: receivedMsg });
                    break;

                case "5": // Voice
                    await conn.sendMessage(senderID, {
                        audio: { url: videoLinks.SD },
                        mimetype: "audio/mp4",
                        ptt: true
                    }, { quoted: receivedMsg });
                    break;

                default:
                    reply("❌ Invalid option! Reply with 1, 2, 3, 4, or 5.");
            }
        });

    } catch (error) {
        console.error("Facebook Download Error:", error);
        reply("❌ Error fetching the video. Please try again.");
    }
});
