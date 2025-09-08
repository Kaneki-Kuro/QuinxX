import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

// === Discord Client ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CHANNEL_ID = process.env.CHANNEL_ID;

// === Hugging Face Image Generator ===
async function generateImage(prompt) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const contentType = response.headers.get("content-type");

    // If Hugging Face sends back JSON, it's an error message
    if (contentType.includes("application/json")) {
      const err = await response.json();
      console.error("Hugging Face error:", err);
      return { error: err.error || "Unknown error from API" };
    }

    // Otherwise it's an image
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return { buffer };
  } catch (err) {
    console.error("Fetch failed:", err);
    return { error: "Failed to contact Hugging Face API" };
  }
}

// === Discord Bot Events ===
client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id !== CHANNEL_ID) return;

  if (msg.content.toLowerCase().startsWith("generate")) {
    const prompt = msg.content.replace(/generate/i, "").trim();
    if (!prompt) return msg.reply("❌ Please provide a prompt after `Generate`.");

    await msg.channel.send(`🎨 Generating image for: *${prompt}* ...`);

    const result = await generateImage(prompt);

    if (result.error) {
      return msg.channel.send(`⚠️ Failed to generate image: ${result.error}`);
    }

    await msg.channel.send({
      files: [{ attachment: result.buffer, name: "image.png" }]
    });
  }
});

// === Express Web Server (for Render + UptimeRobot) ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🤖 Discord AI Image Bot is running!");
});

app.listen(PORT, () => {
  console.log(`🌍 Web server running on port ${PORT}`);
});

// === Start Bot ===
client.login(process.env.DISCORD_TOKEN);
