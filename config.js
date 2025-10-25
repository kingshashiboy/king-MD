const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}

module.exports = {
  SESSION_ID: process.env.SESSION_ID || "suho~7RlHlSTT#WdJg5kL4mLQQXD22ZrixMPVdwwen73u-e3tv_goDP3k",
  ALIVE_MSG: process.env.ALIVE_MSG || "☘️I made bot successful,bot is online ☘️",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/ue4ppc.jpg",
  BOT_NAME: process.env.BOT_NAME || "𝐀𝐆𝐍𝐈",
  OWNER_NAME: process.env.OWNER_NAME || "shashika dilshan",
  MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://raw.githubusercontent.com/kingshashiboy/king-MD/refs/heads/main/all/alive/Picsart_25-09-06_12-15-06-946.jpg",
  FOOTER: process.env.FOOTER || "𝐀𝐆𝐍𝐈",
  DESCRIPTION: process.env.DESCRIPTION || "𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧",
  AUTO_READ: process.env.AUTO_READ || "true",
  AUTO_REACT: process.env.AUTO_REACT || "true",
  MODE : process.env.MODE || "public",  
  AUTO_RECORDING: (process.env.AUTO_RECORDING || "true",
  AUTO_REPLY: process.env.AUTO_REPLY || "true",
  AUTO_STICKER: process.env.AUTO_STICKER || "true",
  AUTO_VOICE: process.env.AUTO_VOICE || "true",
  AUTO_TYPING: process.env.AUTO_TYPING: 'true',     // 💬 Typing animation
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE: 'true',      // 🌐 Keep bot always online
  AUTO_STATUS_VIEW: process.env.AUTO_STATUS_VIEW: 'true',   // 👁️‍🗨️ View WhatsApp statuses
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT: 'true'  // 💞 React to statuses
  }
};
