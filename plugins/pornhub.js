const axios = require('axios');
const { cmd } = require("../command");
const config = require("../config");

const apilink = "https://apiskeith.vercel.app/download/xvideos?url=";
const oce = '`';

function formatNumber(num) {
    return String(num).padStart(2, '0');
}

cmd({
    pattern: "xvideo",
    alias: ["xv"],
    react: "🔞",
    desc: "Search & Download Xvideos video",
    category: "download",
    use: ".xvideo < link >",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("Provide a video link!");

        // Fetch video data from API
        const videoRes = await axios.get(`${apilink}${encodeURIComponent(q)}`);
        const data = videoRes.data?.result;

        if (!data) return await reply("Download link not found ❌");

        // Send video as document
        await conn.sendMessage(from, {
            document: { url: data },
            mimetype: "video/mp4",
            fileName: `xvideo.mp4`,
            caption: `Video downloaded from Xvideos\n\n${config.FOOTER}`
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (e) {
        console.log(e);
        await reply("Error fetching video!");
    }
});
