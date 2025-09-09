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

// ==== Image Generation ====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith("generate ")) {
    const prompt = message.content.slice(9).trim();
    if (!prompt) {
      return message.reply("❌ Please provide something to generate (e.g., `generate a cat`).");
    }

    try {
      await message.channel.send(`🎨 Generating: **${prompt}** ...`);

      const response = await fetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`);

      if (!response.ok) {
        console.error(`Lexica API failed: ${response.status} ${response.statusText}`);
        return message.reply("⚠️ Image service failed. Try again later.");
      }

      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        return message.reply("⚠️ No images found. Try a different prompt.");
      }

      const imageUrl = data.images[0].src;

      // fetch image as buffer
      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) {
        console.error(`Failed to download image: ${imgResponse.status} ${imgResponse.statusText}`);
        return message.reply("⚠️ Could not download the image. Try again.");
      }

      const buffer = Buffer.from(await imgResponse.arrayBuffer());

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
