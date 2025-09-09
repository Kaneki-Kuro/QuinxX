// index.js
import express from "express";
import fetch from "node-fetch";
import {
  Client,
  GatewayIntentBits,
  AttachmentBuilder
} from "discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("✅ Bot is running!"));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";
const HF_API_KEY = process.env.HF_API_KEY;

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith("generate")) {
    const prompt = message.content.slice(8).trim();
    if (!prompt) {
      return message.reply("❌ Please provide a prompt, e.g., `generate a cat`");
    }

    await message.channel.send(`🎨 Generating image for: **${prompt}** ...`);

    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HF API Error:", errorText);
        return message.reply("⚠️ Failed to generate image. Try again later.");
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const attachment = new AttachmentBuilder(buffer, { name: "image.png" });
      await message.channel.send({ files: [attachment] });

    } catch (err) {
      console.error("Bot error:", err);
      message.reply("⚠️ Error generating the image.");
    }
  }
});

client.login(process.env.BOT_TOKEN);

    await message.channel.send(`🎨 Generating image for: **${prompt}** ...`);

    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HF API Error:", errorText);
        return message.reply("⚠️ Failed to generate image. Try again later.");
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Send as PNG so Discord renders it properly
      const attachment = new AttachmentBuilder(buffer, { name: "image.png" });
      await message.channel.send({ files: [attachment] });

    } catch (err) {
      console.error("Bot error:", err);
      message.reply("⚠️ Error generating the image.");
    }
  }
});

client.login(process.env.BOT_TOKEN);
