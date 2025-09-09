import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Web server for Render (keeps bot alive)
app.get("/", (req, res) => {
  res.send("Bot is running!");
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Hugging Face API Call
async function generateImage(prompt) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      console.error("HuggingFace API error:", await response.text());
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error("Image generation failed:", err);
    return null;
  }
}

// Command: "generate ..."
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith("generate")) {
    const prompt = message.content.replace("generate", "").trim();
    if (!prompt) return message.reply("Please provide something to generate!");

    await message.channel.send(`🎨 Generating: **${prompt}** ...`);

    const imageBuffer = await generateImage(prompt);

    if (!imageBuffer) {
      return message.reply("❌ Failed to generate image from Hugging Face API.");
    }

    await message.channel.send({
      content: `Here is your **${prompt}**:`,
      files: [{ attachment: imageBuffer, name: "generated.png" }],
    });
  }
});

client.login(process.env.BOT_TOKEN);
