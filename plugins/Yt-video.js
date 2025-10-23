const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch'); // Ensure this line exists if not globally available

cmd({
    pattern: "video",
    alias: ["mp4", "song"],
    react: "🎥",
    desc: "Download video from YouTube",
    category: "download",
    use: ".video <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a video name or YouTube URL!");

        let videoUrl, title;

        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            title = "YouTube Video";
        } else {
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ Downloading video... Please wait.");

        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();

        if (!data.result || !data.result.download_url)
            return await reply("❌ Failed to get video download link!");

        await conn.sendMessage(from, {
            video: { url: data.result.download_url },
            mimetype: 'video/mp4',
            caption: `🎬 *${title.substring(0, 60)}*`
        }, { quoted: mek });

        await reply(`✅ Video sent successfully: ${title}`);

    } catch (error) {
        console.error("Video Download Error:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});
