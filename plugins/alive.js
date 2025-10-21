const { cmd } = require("../command");

cmd(
  {
    pattern: "alive",
    react: "🤖",
    desc: "Show bot status",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply }) => {
    try {
      const from = mek.key.remoteJid;

      await malvin.sendPresenceUpdate("recording", from);

      // Alive Image & Caption
      await malvin.sendMessage(
        from,
        {
          image: {
            url: "https://files.catbox.moe/ue4ppc.jpg",
          },
          caption: `𝐀𝐆𝐍𝐈 𝗜𝗦 𝗔𝗟𝗜𝗩𝗘 𝗡𝗢𝗪  

𝗢𝘄𝗻𝗲𝗿 -: Shashika dilshan
          
*We are not responsible for any*  
*WhatsApp bans that may occur due to*  
*the usage of this bot. Use it wisely*  
*and at your own risk* ⚠️`,
        },
        { quoted: mek }
      );

      // Delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Voice Message
      await malvin.sendMessage(
        from,
        {
          audio: {
            url: "https://files.catbox.moe/wz8rh7.mp3",
          },
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("❌ Error in .alive command:", e);
      reply("❌ Error while sending alive message!");
    }
          })
    
