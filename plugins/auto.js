/*
 * ☘️agni🍀 Smart Behaviour Plugin
 * Features:
 *   💬 Auto Typing
 *   🎙 Auto Recording
 *   🌐 Always Online
 *   👁️ Auto Read
 *   ❤️ Auto React
 *   👁️‍🗨️ Auto Status Seen + React
 * Author: Shashika Dilshan
 */

const { delay } = require('@whiskeysockets/baileys');
const config = require('../config');

const EMOJIS = ['❤️','🔥','😂','😎','😍','🤩','🤣','💫','💥','💋','🥰','😉','👑','💀'];

module.exports = {
  name: "auto-behaviour",
  alias: ["autobehavior", "autostatus"],
  desc: "Automatic behaviour system (typing, recording, seen, online, react, status)",
  async function (m, conn) {
    try {
      const { key, message } = m;
      if (!message || key.fromMe) return;

      const jid = key.remoteJid;

      // 🌐 Always Online
      if (config.ALWAYS_ONLINE === 'true') {
        conn.sendPresenceUpdate('available', jid);
      }

      // 💬 Typing Effect
      if (config.AUTO_TYPING === 'true') {
        await conn.sendPresenceUpdate('composing', jid);
        await delay(1000);
      }

      // 🎙 Recording Effect
      if (config.AUTO_RECORDING === 'true') {
        await conn.sendPresenceUpdate('recording', jid);
        await delay(1500);
      }

      // 👁️ Auto Read
      if (config.AUTO_READ === 'true') {
        await conn.readMessages([key]);
      }

      // ❤️ Auto React
      if (config.AUTO_REACT === 'true') {
        const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        await conn.sendMessage(jid, { react: { text: randomEmoji, key } });
      }

      // 👁️‍🗨️ Auto Status Seen + React
      if (config.AUTO_STATUS_VIEW === 'true') {
        const statusJids = Object.keys(conn.contacts).filter(j => j.endsWith('@s.whatsapp.net'));
        for (const s of statusJids) {
          try {
            await conn.readMessages([{ remoteJid: 'status@broadcast', id: s }]);
            console.log(`👁️ Seen status from ${s}`);
            if (config.AUTO_STATUS_REACT === 'true') {
              const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
              await conn.sendMessage('status@broadcast', {
                react: { text: emoji, key: { remoteJid: s } }
              });
              console.log(`❤️ Reacted with ${emoji} to ${s}'s status`);
            }
            await delay(2000);
          } catch (e) {
            console.log(`⚠️ Status error for ${s}:`, e.message);
          }
        }
      }

      await conn.sendPresenceUpdate('available', jid);
    } catch (e) {
      console.error('⚠️ Auto Behaviour Error:', e);
    }
  }
};
