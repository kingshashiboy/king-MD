

const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const Config = require('../config');

// Optimized axios instance
const axiosInstance = axios.create({
  timeout: 15000,
  maxRedirects: 5,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

// Kaiz-API configuration
const KAIZ_API_KEY = 'cf2ca612-296f-45ba-abbc-473f18f991eb'; // Replace if needed
const KAIZ_API_URL = 'https://kaiz-apis.gleeze.com/api/ytdown-mp3';

cmd(
    {
        pattern: 'song',
        alias: ['ytaudio', 'music'],
        desc: 'High quality YouTube audio downloader',
        category: 'media',
        react: '🎵',
        use: '<YouTube URL or search query>',
        filename: __filename,
    },
    async (malvin, mek, m, { text, reply }) => {
        try {
            if (!text) return reply('🎵 *Usage:* .song <query/url>\nExample: .song https://youtu.be/ox4tmEV6-QU\n.song Alan Walker faded');

            // Send initial reaction
            try {
                if (mek?.key?.id) {
                    await malvin.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });
                }
            } catch (reactError) {
                console.error('Reaction error:', reactError);
            }

            // Get video information
            let videoUrl, videoInfo;
            const isYtUrl = text.match(/(youtube\.com|youtu\.be)/i);
            
            if (isYtUrl) {
                // Handle YouTube URL
                const videoId = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
                if (!videoId) return reply('❌ Invalid YouTube URL format');
                
                videoUrl = `https://youtu.be/${videoId}`;
                try {
                    videoInfo = await yts({ videoId });
                    if (!videoInfo) throw new Error('Could not fetch video info');
                } catch (e) {
                    console.error('YT-Search error:', e);
                    return reply('❌ Failed to get video information from URL');
                }
            } else {
                // Handle search query
                try {
                    const searchResults = await yts(text);
                    if (!searchResults?.videos?.length) {
                        return reply('❌ No results found. Try different keywords.');
                    }

                    // Filter results (exclude live streams and very long videos)
                    const validVideos = searchResults.videos.filter(v => 
                        !v.live && v.seconds < 7200 && v.views > 10000
                    );

                    if (!validVideos.length) {
                        return reply('❌ Only found live streams/unpopular videos. Try a different search.');
                    }

                    // Select best match (top result by default)
                    videoInfo = validVideos[0];
                    videoUrl = videoInfo.url;

                    console.log('Selected video:', {
                        title: videoInfo.title,
                        duration: videoInfo.timestamp,
                        views: videoInfo.views.toLocaleString(),
                        url: videoInfo.url
                    });
                } catch (searchError) {
                    console.error('Search error:', searchError);
                    return reply('❌ Search failed. Please try again later.');
                }
            }

            // Fetch audio from Kaiz-API
            const apiUrl = `${KAIZ_API_URL}?url=${encodeURIComponent(videoUrl)}&apikey=${KAIZ_API_KEY}`;
            let songData;
            
            try {
                const apiResponse = await axiosInstance.get(apiUrl);
                if (!apiResponse.data?.download_url) {
                    throw new Error('Invalid API response');
                }
                songData = apiResponse.data;
            } catch (apiError) {
                console.error('API error:', apiError);
                return reply('❌ Audio download failed. The service might be unavailable.');
            }

            // Get thumbnail
            let thumbnailBuffer;
            try {
                const thumbnailUrl = videoInfo?.thumbnail;
                if (thumbnailUrl) {
                    const response = await axiosInstance.get(thumbnailUrl, { 
                        responseType: 'arraybuffer',
                        timeout: 8000 
                    });
                    thumbnailBuffer = Buffer.from(response.data, 'binary');
                }
            } catch (e) {
                console.error('Thumbnail error:', e);
                thumbnailBuffer = null;
            }

            // Prepare song information message
           const songInfo = `╭───『 🎧 𝚜𝚘𝚗𝚐 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚛 』──
│
│ 📀 𝚃𝙸𝚃𝙻𝙴    : ${songData.title || videoInfo?.title || 'Unknown'}
│ ⏱️ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽 : ${videoInfo?.timestamp || 'Unknown'}
│ 👁️ 𝚅𝙸𝙴𝚆𝚂    : ${videoInfo?.views?.toLocaleString() || 'Unknown'}
│ 🌍 𝙿𝚄𝙱𝙻𝙸𝚂𝙷𝙴𝙳 : ${videoInfo?.ago || 'Unknown'}
│ 👤 𝙰𝚄𝚃𝙷𝙾𝚁   : ${videoInfo?.author?.name || 'Unknown'}
│ 🔗 𝚄𝚁𝙻      : ${videoUrl || 'Unknown'}
│
╰──────────

╭───⌯ 𝙲𝙷𝙾𝙾𝚂𝙴 𝚃𝚈𝙿𝙴 ⌯───╮
│ 𝟷. 🎵 𝚊𝚞𝚍𝚒𝚘 𝚝𝚢𝚙𝚎 (𝚙𝚕𝚊𝚢)
│ 𝟸. 📁 𝚍𝚘𝚌𝚞𝚖𝚎𝚗𝚝 𝚝𝚢𝚙𝚎 (𝚜𝚊𝚟𝚎)
╰───────────────╯

🔊 𝚁𝚎𝚙𝚕𝚢 𝚠𝚒𝚝𝚑 *1* 𝚘𝚛 *2*
> ${Config.FOOTER || 'Powered By Lucky Tech Hub'}`;

            // Send song info with thumbnail
            const sentMsg = await malvin.sendMessage(mek.chat, {
                image: thumbnailBuffer,
                caption: songInfo,
                contextInfo: {
                    externalAdReply: {
                        title: songData.title || videoInfo?.title || 'YouTube Audio',
                        body: `Duration: ${videoInfo?.timestamp || 'N/A'}`,
                        thumbnail: thumbnailBuffer,
                        mediaType: 1,
                        mediaUrl: videoUrl,
                        sourceUrl: videoUrl
                    }
                }
            }, { quoted: mek });

            // Set up response listener
            const timeout = setTimeout(() => {
                malvin.ev.off('messages.upsert', messageListener);
                reply("⌛ Session timed out. Please use the command again if needed.");
            }, 60000);

            const messageListener = async (messageUpdate) => {
                try {
                    const mekInfo = messageUpdate?.messages[0];
                    if (!mekInfo?.message) return;

                    const message = mekInfo.message;
                    const messageType = message.conversation || message.extendedTextMessage?.text;
                    const isReplyToSentMsg = message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

                    if (!isReplyToSentMsg || !['1', '2'].includes(messageType?.trim())) return;

                    // Clean up listener and timeout
                    malvin.ev.off('messages.upsert', messageListener);
                    clearTimeout(timeout);

                    await reply("⏳ Downloading your audio... Please wait...");

                    // Download audio
                    const audioResponse = await axiosInstance.get(songData.download_url, {
                        responseType: 'arraybuffer',
                        headers: { 
                            Referer: 'https://www.youtube.com/',
                            'Accept-Encoding': 'identity'
                        },
                        timeout: 30000
                    });

                    const audioBuffer = Buffer.from(audioResponse.data, 'binary');
                    const fileName = `${(songData.title || videoInfo?.title || 'audio').replace(/[<>:"\/\\|?*]+/g, '')}.mp3`;

                    // Send audio based on user choice
                    if (messageType.trim() === "1") {
                        await malvin.sendMessage(mek.chat, {
                            audio: audioBuffer,
                            mimetype: 'audio/mpeg',
                            fileName: fileName,
                            ptt: false
                        }, { quoted: mek });
                    } else {
                        await malvin.sendMessage(mek.chat, {
                            document: audioBuffer,
                            mimetype: 'audio/mpeg',
                            fileName: fileName
                        }, { quoted: mek });
                    }

                    // Send success reaction
                    try {
                        if (mekInfo?.key?.id) {
                            await malvin.sendMessage(mek.chat, { react: { text: "✅", key: mekInfo.key } });
                        }
                    } catch (reactError) {
                        console.error('Success reaction failed:', reactError);
                    }

                } catch (error) {
                    console.error('Download error:', error);
                    await reply('❌ Download failed: ' + (error.message || 'Network error'));
                    try {
                        if (mek?.key?.id) {
                            await malvin.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
                        }
                    } catch (reactError) {
                        console.error('Error reaction failed:', reactError);
                    }
                }
            };

            malvin.ev.on('messages.upsert', messageListener);

        } catch (error) {
            console.error('Main error:', error);
            reply('❌ An unexpected error occurred: ' + (error.message || 'Please try again later'));
            try {
                if (mek?.key?.id) {
                    await malvin.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
                }
            } catch (reactError) {
                console.error('Final reaction failed:', reactError);
            }
        }
    }
);
