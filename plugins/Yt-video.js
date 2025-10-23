const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');

cmd({
    pattern: "video",
    alias: ["mp4", "song"],
    react: "🎥",
    desc: "YouTube වීඩියෝ එකක් download කරන්න",
    category: "download",
    use: ".video <නමක් හෝ YouTube URL එක>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ කරුණාකර video එකේ නමක් හෝ YouTube URL එකක් දෙන්න!");

        let videoUrl, title;

        // URL එකක් දෙනවාද කියලා check කරනවා
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            title = "YouTube Video";
        } else {
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ කිසිදු result එකක් හමු නොවීය!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ Video එක download කරමින්... කරුණාකර බලා සිටින්න.");

        // Download API එකෙන් video link එක ලබාගන්නවා
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;

        // Retry function
        async function fetchWithRetry(url, retries = 3, delay = 3000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                    return res;
                } catch (e) {
                    if (i === retries - 1) throw e;
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        const response = await fetchWithRetry(apiUrl);
        const data = await response.json();

        if (!data.result || !data.result.download_url)
            return await reply("❌ Video download link එක ලබාගැනීමට අසාර්ථක විය!");

        // API link එකෙන් video එක buffer එකකට download කරනවා
        const videoResp = await fetchWithRetry(data.result.download_url);
        const buffer = await videoResp.arrayBuffer();

        // File size check (WhatsApp limit ~64MB)
        const sizeMB = buffer.byteLength / (1024 * 1024);
        if (sizeMB > 60) return await reply("❌ Video එක විශාලයි (>60MB). කෙටි clip එකක් උත්සාහ කරන්න.");

        // Video send කරනවා
        await conn.sendMessage(from, {
            video: Buffer.from(buffer),
            mimetype: 'video/mp4',
            caption: `🎬 *${title.substring(0, 60)}*`
        }, { quoted: mek });

        await reply(`✅ Video එක යවනු ලැබුනා: ${title}`);

    } catch (error) {
        console.error("Video Download Error:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});
