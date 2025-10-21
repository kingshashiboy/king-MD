const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');
const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";
const OMDB_KEY = "76cb7f39";

async function translateToSinhala(text) {
    try {
        const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`);
        return res.data.responseData.translatedText || text;
    } catch {
        return text;
    }
}

cmd({
    pattern: "movieinfo",
    desc: "Get HD official movie poster with Sinhala details",
    category: "download",
    react: "♻️",
    alias: ['info', 'in'],

    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("❗කරුණාකර චිත්‍රපටයේ නම දෙන්න.\nඋදා: `.movie Avengers Endgame`");

    try {
        // Search movie from TMDB
        const searchRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}`);
        if (!searchRes.data.results.length) return reply("😓 චිත්‍රපටය සොයාගත නොහැකි විය.");

        const movie = searchRes.data.results[0];
        const movieId = movie.id;

        // Movie details
        const detailsRes = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_KEY}`);
        const poster = `https://image.tmdb.org/t/p/original${detailsRes.data.poster_path}`;

        // OMDb info
        const omdbRes = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(q)}&apikey=${OMDB_KEY}`);
        const omdb = omdbRes.data;

        // Translate plot
        const englishPlot = omdb.Plot || detailsRes.data.overview || "N/A";
        const sinhalaPlot = await translateToSinhala(englishPlot);

        // Sinhala caption
        const caption = `☣️ *Movie Name:-* ${omdb.Title || movie.title} (${omdb.Year || detailsRes.data.release_date?.slice(0, 4)})\n\n` +
                        `⭐ *IMDb අගය:* ${omdb.imdbRating || "N/A"}\n` +
                        `🎭 *කාණ්ඩය:* ${omdb.Genre || "N/A"}\n` +
                        `🕒 *ධාවන කාලය:* ${omdb.Runtime || "N/A"}\n\n` +
                        `🗣️ *අවශ්‍ය අනෙක් ගෘප් ලින්ක් සහ වෙනත් දෑ චැනල් එකෙන් ගන්න, ෆලෝ කරල තියාගන්න 👇*\n\n` +
                        `📌 *Movie Channel :- _https://whatsapp.com/channel/0029Vb5xFPHGE56jTnm4ZD2k_*\n\n` +
                        `📌 *Song Channel :- _https://whatsapp.com/channel/0029VbAdks3I7BeO8aUGNG06_*\n\n` +
                        `🗣️ *කතා විස්තරය :* ${sinhalaPlot}\n\n` +
                        `${config.BOT_NAME}`;

        // Verified + Newsletter Style
        const newsletterInfo = {
            key: {
                remoteJid: 'status@broadcast',
                participant: '0@s.whatsapp.net'
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363417070951702@newsletter',
                    newsletterName: "MOVIE CIRCLE",
                    caption: "𝙳𝙴𝚃𝙰𝙸𝙻𝚂 𝙲𝙰𝚁𝙳 𝚅𝙴𝚁𝙸𝙵𝙸𝙴𝙳 𝙱𝚈 𝙺𝙰𝚅𝙸𝙳𝚄 𝚁𝙰𝚂𝙰𝙽𝙶𝙰",
                    inviteExpiration: 0
                }
            }
        };

        await conn.sendMessage(from, {
            image: { url: poster },
            caption: caption,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363203776689544@newsletter',
                    newsletterName: 'SHASHIKA DILSHANツ',
                    serverMessageId: 143
                }
            }
        }, { quoted: newsletterInfo });

    } catch (err) {
        console.error(err);
        reply("❌ දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.");
    }
});
                      
