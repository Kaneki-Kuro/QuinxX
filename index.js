const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

// ===== Express server for Render Web Service =====
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
// ===============================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Function to generate image using Hugging Face
async function generateImage(prompt) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        }
    );

    if (!response.ok) {
        throw new Error(`HF API error: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.ALLOWED_CHANNEL_ID) return;
    if (!message.content.toLowerCase().startsWith('generate ')) return;

    const prompt = message.content.slice(9).trim();
    if (!prompt) return message.reply('Please provide something to generate!');

    const generatingEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(`Generating image of '${prompt}'`)
        .setDescription("It will take 10-15 seconds...")
        .setFooter({ text: "If it has any issues, create a ticket." });

    try {
        const sentMessage = await message.channel.send({ embeds: [generatingEmbed] });

        const imageBuffer = await generateImage(prompt);

        const finishedEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Here is your image of '${prompt}'!`)
            .setFooter({ text: "If it has any issues, create a ticket." });

        await sentMessage.edit({
            embeds: [finishedEmbed],
            files: [{ attachment: imageBuffer, name: "image.png" }]
        });

    } catch (error) {
        console.error(error);

        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Failed to generate image.')
            .setDescription(error.message || 'Please try again later.')
            .setFooter({ text: "If it has any issues, create a ticket." });

        message.channel.send({ embeds: [errorEmbed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
