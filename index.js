import { Client, GatewayIntentBits, AttachmentBuilder } from "discord.js";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// ==== Discord Client ====
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// ==== Web Server for Render ====
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Bot is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ==== Bot Ready ====
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ==== Image Generation with Hugging Face ====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith("generate ")) {
    const prompt = message.content.slice(9).trim();
    if (!prompt) {
      return message.reply("❌ Please provide something to generate (e.g., `generate a cat`).");
    }

    try {
      await message.channel.send(`🎨 Generating: **${prompt}** ...`);

      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        console.error("Hugging Face API error:", response.status, response.statusText);
        return message.reply("⚠️ Hugging Face API failed. Try again later.");
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // attach the image
      const attachment = new AttachmentBuilder(buffer, { name: "generated.png" });
      await message.channel.send({
        content: `🖼️ Here’s your image for: **${prompt}**`,
        files: [attachment],
      });

    } catch (err) {
      console.error("Image generation error:", err);
      message.reply("❌ Failed to generate image. Please try again.");
    }
  }
});

// ==== Login Bot ====
client.login(process.env.TOKEN);
