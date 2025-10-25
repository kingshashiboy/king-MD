cmd({
  pattern: "magicimage",
  alias: ["aiimage", "generateimage"],
  desc: "Generate AI images from text prompts",
  react: "🎨",
  category: "tool",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) {
      return reply("❌ Please provide a text prompt to generate an image.");
    }

    const prompt = encodeURIComponent(q);
    const apiUrl = `https://apiskeith.vercel.app/ai/magicstudio?prompt=${prompt}`;

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.result || !data.result.url) {
      return reply("⚠️ Failed to generate image. Please try again.");
    }

    const imageUrl = data.result.url;
    await conn.sendMessage(from, {
      image: { url: imageUrl },
      caption: `✨ AI-generated image for prompt: "${q}"`
    }, { quoted: m });

    await conn.sendMessage(from, {
      react: { text: "✅", key: m.key }
    });

  } catch (error) {
    console.error("Error generating image:", error);
    reply("❌ An error occurred while generating the image. Please try again.");
  }
});
