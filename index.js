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
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// ==== Bot Ready ====
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ==== Image Generation ====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Command format: generate <prompt>
  if (message.content.toLowerCase().startsWith("generate ")) {
    const prompt = message.content.slice(9).trim();
    if (!prompt) {
      return message.reply("❌ Please provide something to generate (e.g., `generate a cat`).");
    }

    try {
      await message.channel.send(`🎨 Generating: **${prompt}** ...`);

      // Use Lexica API for free image generation
      const response = await fetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`);
      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        return message.reply("⚠️ No images found. Try a different prompt.");
      }

      // Pick first image
      const imageUrl = data.images[0].src;

      // Fetch image as buffer
      const imgResponse = await fetch(imageUrl);
      const buffer = Buffer.from(await imgResponse.arrayBuffer());

      // Send as real Discord image
      const attachment = new AttachmentBuilder(buffer, { name: "generated.png" });
      await message.channel.send({ content: `🖼️ Here’s your image for: **${prompt}**`, files: [attachment] });

    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to generate image. Please try again.");
    }
  }
});

// ==== Login Bot ====
client.login(process.env.TOKEN);
