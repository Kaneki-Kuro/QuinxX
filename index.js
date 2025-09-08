import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const channelId = process.env.CHANNEL_ID; // Only listen in this channel
const hfToken = process.env.HF_TOKEN; // Hugging Face API key

client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== channelId || msg.author.bot) return;

  if (msg.content.toLowerCase().startsWith("generate")) {
    const prompt = msg.content.replace(/generate/i, "").trim();
    if (!prompt) return msg.reply("❌ Please provide a prompt after `Generate`.");

    await msg.channel.send(`🎨 Generating image for: *${prompt}* ...`);

    try {
      const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      });

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length < 1000) {
        return msg.channel.send("❌ Failed to generate image. Try again.");
      }

      await msg.channel.send({ files: [{ attachment: buffer, name: "image.png" }] });
    } catch (err) {
      console.error(err);
      msg.channel.send("⚠️ Error while generating image.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
