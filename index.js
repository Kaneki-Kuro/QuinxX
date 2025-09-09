const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();
const express = require('express');

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

// OpenAI initialization
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.ALLOWED_CHANNEL_ID) return;
    if (!message.content.toLowerCase().startsWith('generate ')) return;

    const prompt = message.content.slice(9).trim();
    if (!prompt) return message.reply('Please provide something to generate!');

    // Build "Generating" embed safely
    const generatingEmbed = new EmbedBuilder();
    generatingEmbed.setColor('Yellow');
    generatingEmbed.setTitle(`Generating image of '${prompt}'`);
    generatingEmbed.setDescription("It will take 10-15 seconds...");
    generatingEmbed.setFooter({ text: "If it has any issues, create a ticket." });

    try {
        const sentMessage = await message.channel.send({ embeds: [generatingEmbed] });

        const response = await openai.images.generate({
            model: "gpt-image-1",
            prompt,
            size: "1024x1024" // ✅ Valid size
        });

        const imageUrl = response.data[0].url;

        const finishedEmbed = new EmbedBuilder();
        finishedEmbed.setColor('Green');
        finishedEmbed.setTitle(`Here is your image of '${prompt}'!`);
        finishedEmbed.setImage(imageUrl);
        finishedEmbed.setFooter({ text: "If it has any issues, create a ticket." });

        await sentMessage.edit({ embeds: [finishedEmbed] });

    } catch (error) {
        console.error(error);

        const errorEmbed = new EmbedBuilder();
        errorEmbed.setColor('Red');
        errorEmbed.setTitle('Failed to generate image.');
        errorEmbed.setDescription('Please try again later.');
        errorEmbed.setFooter({ text: "If it has any issues, create a ticket." });

        message.channel.send({ embeds: [errorEmbed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
    const prompt = message.content.slice(9).trim();
    if (!prompt) return message.reply('Please provide something to generate!');

    // Initial "Generating" embed
    const generatingEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(`Generating image of '${prompt}'`)
        .setDescription("It will take 10-15 seconds...")
        .setFooter({ text: "If it has any issues, create a ticket." });

    try {
        const sentMessage = await message.channel.send({ embeds: [generatingEmbed] });

        // ✅ Generate image from OpenAI
        const response = await openai.images.generate({
            model: "gpt-image-1",
            prompt,
            size: "1024x1024" // ✅ fixed size
        });

        const imageUrl = response.data[0].url;

        // Finished embed
        const finishedEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Here is your image of '${prompt}'!`)
            .setImage(imageUrl)
            .setFooter({ text: "If it has any issues, create a ticket." });

        await sentMessage.edit({ embeds: [finishedEmbed] });

    } catch (error) {
        console.error(error);

        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Failed to generate image.')
            .setDescription('Please try again later.')
            .setFooter({ text: "If it has any issues, create a ticket." });

        message.channel.send({ embeds: [errorEmbed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
        .setTitle(`Generating image of '${prompt}'`)
        .setDescription("It will take 10-15 seconds...")
        .setFooter({ text: "If it has any issues, create a ticket." });

    try {
        const sentMessage = await message.channel.send({ embeds: [generatingEmbed] });

        // ✅ Generate image from OpenAI
        const response = await openai.images.generate({
            model: "gpt-image-1",
            prompt,
            size: "512x512"
        });

        const imageUrl = response.data[0].url;

        // Finished embed
        const finishedEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Here is your image of '${prompt}'!`)
            .setImage(imageUrl)
            .setFooter({ text: "If it has any issues, create a ticket." });

        await sentMessage.edit({ embeds: [finishedEmbed] });

    } catch (error) {
        console.error(error);

        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Failed to generate image.')
            .setDescription('Please try again later.')
            .setFooter({ text: "If it has any issues, create a ticket." });

        message.channel.send({ embeds: [errorEmbed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
