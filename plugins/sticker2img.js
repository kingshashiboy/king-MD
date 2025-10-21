const { cmd, commands } = require("../command");
const { Sticker } = require("wa-sticker-formatter");
const { downloadMediaMessage } = require("../lib/msg.js"); // Adjust the path as needed
const fs = require("fs");

cmd(
  {
    pattern: "toimg",
    alias: ["img", "photo"],
    react: "🖼️",
    desc: "Convert a sticker to an image",
    category: "convert",
    filename: __filename,
  },
  async (
    malvin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      // Ensure the message contains a sticker to convert
      if (!quoted || quoted.stickerMessage == null) {
        return reply("Please reply to a sticker to convert it to an image.");
      }

      // Download the sticker from the quoted message
      const stickerBuffer = await downloadMediaMessage(quoted, "stickerInput");
      if (!stickerBuffer)
        return reply("Failed to download the sticker. Try again!");

      // Convert the sticker buffer to an image (using Sticker class)
      const sticker = new Sticker(stickerBuffer, {
        pack: "𝗠𝗔𝗟𝗨 𝗫𝗗",
        author: "ᴍᴀʟᴠɪɴ ᴋɪɴɢ",
        type: "FULL", // This may not be needed, but ensures we're using the full sticker format
        quality: 100, // Quality of the output image (0-100)
      });

      // Get the image buffer
      const imageBuffer = await sticker.toBuffer({ format: "image/jpeg" });

      // Send the image as a response
      await malvin.sendMessage(
        from,
        {
          image: imageBuffer,
          caption: "Here is your converted image!\n\n 𝗠𝗔𝗗𝗘 𝗕𝗬 𝗠𝗔𝗟𝗨 𝗫𝗗",
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message || e}`);
    }
  }
);
    
