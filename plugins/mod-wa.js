// mod-wap-dl with auto message

cmd({
  pattern: "modwa",
  alias: ["modwhatsapp", "modwap"],
  desc: "Download MOD WhatsApp APKs",
  react: "📱",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return reply("❌ Please provide a valid MOD WhatsApp URL.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `https://apiskeith.vercel.app/download/modwadl?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.status || !data.result) {
      return reply("⚠️ Failed to retrieve the MOD WhatsApp APK. Please check the link.");
    }

    const { name, size, version, file } = data.result;
    const caption = `╭═══ 〔 *𝐌𝐎𝐃 𝐖𝐀* 〕═══❐
┃ 🏷️ *Name:* ${name || "Unknown"}
┃ 📦 *Size:* ${size || "Unknown"}
┃ 📅 *Version:* ${version || "Unknown"}
╰══════════════════❐
> *Powered by 𝐌𝐎𝐃 𝐖𝐀 AGNI*`;

    // Send APK document
    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(from, {
      document: { url: file },
      fileName: `${name || "modwa"}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: caption
    }, { quoted: m });

    // **Send a follow-up custom message (MS)**
    await conn.sendMessage(from, {
      text: `✅ APK Downloaded Successfully!\n📌 Make sure to install it safely.`
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the MOD WhatsApp APK. Please try again.");
  }
});
