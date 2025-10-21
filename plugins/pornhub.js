const axios = require('axios');
const { cmd } = require("../command");
const config = require("../config");

const apilink = "https://darkyasiya-new-movie-api.vercel.app/";
const apikey = '';
const oce = '`';

function formatNumber(num) {
    return String(num).padStart(2, '0');
}

cmd({
    pattern: "hub",
    alias: ["ph"],
    react: "🔞",
    desc: "Download Pornhub video",
    category: "download",
    use: ".ph < query >",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("Query need ?");

        const searchRes = (await axios.get(`${apilink}/api/other/pornhub/search?q=${q}&apikey=${apikey}`)).data;
        const response = searchRes?.data;

        if (!response || response.length === 0) return await reply("Result not found: " + q);

        let info = `\`PORNHUB DOWNLOADER\`\n\n`;
        for (let v = 0; v < response.length; v++) {
            info += `*${formatNumber(v + 1)} ||* ${response[v].title}\n`;
        }
        info += `\n${config.FOOTER}`;

        const sentMsg = await conn.sendMessage(from, {
            text: info,
            contextInfo: {
                externalAdReply: {
                    title: "PORNHUB DOWNLOADER",
                    body: "",
                    thumbnailUrl: config.LOGO,
                    mediaType: 1,
                    sourceUrl: q
                }
            }
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        const handler = async (messageUpdate) => {
            const mekInfo = messageUpdate?.messages?.[0];
            if (!mekInfo?.message) return;

            const messageText = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;
            const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (!isReplyToSentMsg) return;

            conn.ev.off('messages.upsert', handler); // remove listener after one response

            try {
                let selectedIndex = parseInt(messageText.trim()) - 1;

                if (selectedIndex >= 0 && selectedIndex < response.length) {
                    const selectVid = response[selectedIndex];
                    await conn.sendMessage(from, { react: { text: '🔌', key: mekInfo.key } });

                    const videoRes = await axios.get(`${apilink}/api/other/pornhub/download?url=${selectVid.videoUrl}&apikey=${apikey}`);
                    const data = videoRes.data?.data;

                    if (!data || !data.videos || data.videos.length === 0) return reply(`*Download link not found. ❌*`);

                    let s_m_g = '';
                    for (let l = 0; l < data.videos.length; l++) {
                        s_m_g += `${formatNumber(l + 1)} || Download ${data.videos[l].quality.split("-")[0].trim()} Quality\n\n`;
                    }

                    let mg = `╭─────────────────────╮\n` +
                        `│ 🔞 *P HUB DOWNLOADER* 🔞 \n` +
                        `├─────────────────────┤\n` +
                        `│ 📜 ${oce}Title:${oce} *${data.title}*\n` +
                        `│\n` +
                        `│ 🗣️ ${oce}Input:${oce} *${q}*\n` +
                        `╰─────────────────────╯\n\n` +
                        `${s_m_g}`;

                    const mass = await conn.sendMessage(from, {
                        image: { url: data.cover || config.LOGO },
                        caption: mg
                    }, { quoted: mekInfo });

                    const messageID2 = mass.key.id;

                    const handler2 = async (update2) => {
                        const replyMsg = update2?.messages?.[0];
                        if (!replyMsg?.message) return;

                        const msgTxt = replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text;
                        const isReplyToSecond = replyMsg?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID2;

                        if (!isReplyToSecond) return;

                        conn.ev.off('messages.upsert', handler2); // remove second listener

                        try {
                            let selected = parseInt(msgTxt.trim()) - 1;
                            if (selected >= 0 && selected < data.videos.length) {
                                const selectedVideo = data.videos[selected];

                                await conn.sendMessage(from, {
                                    react: { text: '⬇️', key: replyMsg.key }
                                });

                                await conn.sendMessage(from, {
                                    document: { url: selectedVideo.url },
                                    mimetype: "video/mp4",
                                    fileName: `${data.title}.mp4`,
                                    caption: `${data.title}\n\n${config.FOOTER}`
                                }, { quoted: replyMsg });

                                await conn.sendMessage(from, {
                                    react: { text: '✅', key: replyMsg.key }
                                });

                            } else {
                                await conn.sendMessage(from, {
                                    text: `Invalid selection. Use 01 - ${data.videos.length}`,
                                    quoted: replyMsg
                                });
                            }
                        } catch (e) {
                            console.log(e);
                            await conn.sendMessage(from, { text: "Error !!" }, { quoted: replyMsg });
                        }
                    };

                    conn.ev.on('messages.upsert', handler2);

                } else {
                    return await conn.sendMessage(from, {
                        text: `Invalid selection. Use 01 - ${response.length}`,
                        quoted: mekInfo
                    });
                }

            } catch (e) {
                console.log(e);
                await conn.sendMessage(from, { text: "Error !!" }, { quoted: mekInfo });
            }
        };

        conn.ev.on('messages.upsert', handler);

    } catch (e) {
        console.log(e);
        await reply("Error !!");
    }
});
  
