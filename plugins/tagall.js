const config = require('../config');
const {
  cmd,
  commands
} = require("../command");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require("../lib/functions");


cmd({
  pattern: "tagall",
  desc: "Tags all members and admins in the group.",
  category: "group",
  react: "🔖",
  use: ".tagall",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, groupMetadata, participants, isOwner, isAdmins, groupAdmins, reply }) => {
  try {
    if (!isGroup) {
      return reply("This command can only be used in groups 🌜");
    }
        if (!isOwner && !isAdmins) {
      return reply("This command can only be used by the bot owner.");
    }
    if (!participants || participants.length === 0) {
      return reply("There are no members in this group.");
    }
    let tagMessage = "*AGNI Mentions : 🔖*\n\n";
    let mentions = [];

    for (let participant of participants) {
      const isAdmin = groupAdmins.includes(participant.id);
      tagMessage += `@${participant.id.split('@')[0]} ${isAdmin ? "(Admin 😇)" : ""}\n`;
      mentions.push(participant.id);
    }
    await conn.sendMessage(from, {
      text: tagMessage,
      mentions: mentions
    }, { quoted: mek });
  } catch (error) {
    console.error("Error tagging members and admins:", error);
    reply("An error occurred while trying to tag all members and admins. Please try again.");
  }
});


cmd({
  pattern: "hidetag",
  desc: "Tag all members in the group without a notification.",
  category: "group",
  react: '🔖',
  filename: __filename
}, async (bot, chat, message, {
  from: groupId,
  body: messageBody,
  isCmd: isCommand,
  command: commandName,
  args: argumentsList,
  q: query,
  isGroup: isGroupChat,
  sender: senderId,
  senderNumber: senderPhoneNumber,
  botNumber2: botSecondaryNumber,
  botNumber: botPrimaryNumber,
  pushname: senderName,
  isMe: isBotOwner,
  isOwner: isGroupOwner,
  groupMetadata: groupData,
  groupName: groupName,
  participants: groupParticipants,
  groupAdmins: groupAdmins,
  isBotAdmins: isBotAdmin,
  isAdmins: isAdmin,
  reply: sendReply
}) => {
  try {
    if (!isGroupChat) {
      return sendReply("*🚨 This command can only be used in a group.*");
    }
    if (!isAdmin && !isBotOwner) {
      return sendReply("*🚨 Only group admins can use this command.*");
    }
    if (!query) {
      return sendReply("Please provide a message to tag.");
    }

    const mentions = groupParticipants.map(participant => participant.id);
    await bot.sendMessage(groupId, {
      text: query,
      mentions
    });
  } catch (error) {
    console.error(error);
    sendReply(`Error: ${error.message}`);
  }
});

  
