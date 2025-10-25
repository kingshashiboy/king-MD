const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config');
const { cmd } = require('../command');

cmd(
  { on: "body" },
  async (conn, mek, m, { from, body }) => {
    try {
      const voicePath = path.join(__dirname, '../data/autovoice.json');
      const voiceData = JSON.parse(fs.readFileSync(voicePath, 'utf8'));

      // 🧩 GitHub Repo Base URL — ඔයාගේ repo එකට අනුව වෙනස් කරන්න
      const voiceBaseUrl = 'https://raw.githubusercontent.com/ishansandeepa18/QUEEN-ASHIYA-MD/main/Queen_Ashiya_Media/voice/';

      // 🔊 AUTO VOICE SYSTEM
      for (const key in voiceData) {
        if (text === key.toLowerCase() && config.AUTO_VOICE === 'true') {
          const fileName = voiceData[key];
          const voiceUrl = `${voiceBaseUrl}${encodeURIComponent(fileName)}`;
          console.log(`🎤 Voice Triggered: ${fileName}`);

          const res = await axios.get(voiceUrl, { responseType: 'arraybuffer' });
          const voiceBuffer = Buffer.from(res.data, 'binary');

          await conn.sendMessage(
            from,
            {
              audio: voiceBuffer,
              mimetype: 'audio/mp4',
              ptt: true // 🎙 voice note style
            },
            { quoted: mek }
          );
        }
      }

    } catch (e) {
      console.error("AutoVoice Error:", e);
    }
  }
);
