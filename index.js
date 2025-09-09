import { 
  Client, 
  GatewayIntentBits, 
  AttachmentBuilder, 
  EmbedBuilder 
} from "discord.js";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// --- CONFIG ---
const DISCORD_TOKEN = process.env.BOT_TOKEN;
const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "runwayml/stable-diffusion-v1-5"; // Hugging Face model

// --- DISCORD CLIENT ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// --- IMAGE GENERATOR FUNCTION ---
async function generateImage(prompt) {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ HuggingFace API error:", errText);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (err) {
    console.error("⚠️ Fetch failed:", err);
    return null;
  }
}

// --- DISCORD EVENTS ---
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!gen")) return;

  const prompt = message.content.replace("!gen", "").trim();
  if (!prompt) {
    return message.reply("⚠️ Please provide a prompt. Example: `!gen cat`");
  }

  // Send temporary "Thinking..." embed
  const embed = new EmbedBuilder()
    .setTitle("🎨 Generating Image...")
    .setDescription(`Prompt: \`${prompt}\`\nThis may take 10–15 seconds ⏳`)
    .setColor("Yellow");

  const thinkingMsg = await message.channel.send({ embeds: [embed] });

  // Generate the image
  const imageBuffer = await generateImage(prompt);

  if (!imageBuffer) {
    return thinkingMsg.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle("❌ Failed to generate image")
          .setDescription("Hugging Face API returned an error. Try again later.")
          .setColor("Red"),
      ],
    });
  }

  try {
    const attachment = new AttachmentBuilder(imageBuffer, { name: "result.png" });

    await thinkingMsg.edit({
      content: `✨ <@${message.author.id}> here is your image for: **${prompt}**`,
      embeds: [],
      files: [attachment],
    });
  } catch (err) {
    console.error("⚠️ Failed to send image:", err);
    await thinkingMsg.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚠️ Image Error")
          .setDescription("Image generated but failed to send. Check logs.")
          .setColor("Orange"),
      ],
    });
  }
});

// --- EXPRESS WEB SERVER (for Render health check / UptimeRobot) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ QuinxX Bot is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// --- LOGIN ---
client.login(DISCORD_TOKEN);
