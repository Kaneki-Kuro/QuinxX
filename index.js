const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY
}));

client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Check if it's the correct channel
    if (message.channel.id !== process.env.ALLOWED_CHANNEL_ID) return;

    // Check if the message starts with "generate "
    if (!message.content.toLowerCase().startsWith('generate ')) return;

    const prompt = message.content.slice(9).trim();
    if (!prompt) return message.reply('Please provide something to generate!');

    // Send initial "Generating" embed
    const generatingEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(`Generating image of '${prompt}'`)
        .setDescription("It will take 10-15 seconds...")
        .setFooter({ text: "If it has any issues, create a ticket." });

    const sentMessage = await message.channel.send({ embeds: [generatingEmbed] });

    try {
        // Generate image dynamically using OpenAI
        const response = await openai.createImage({ prompt, n: 1, size: '512x512' });
        const imageUrl = response.data.data[0].url;

        // Edit embed with the image
        const finishedEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Here is your image of '${prompt}'!`)
            .setImage(imageUrl)
            .setFooter({ text: "If it has any issues, create a ticket." });

        await sentMessage.edit({ embeds: [finishedEmbed] });

    } catch (error) {
        console.error(error);
        sentMessage.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Failed to generate image.')
                    .setDescription('Please try again later.')
                    .setFooter({ text: "If it has any issues, create a ticket." })
            ]
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
