// Load files from the .env file
require('dotenv').config();

const { Client } = require('discord.js');

const bot = new Client();

bot.once('ready', () => {
  console.log('   __________  _   ______        __');
  console.log('  / ____/ __ \\/ | / / __ )____  / /_');
  console.log(' / / __/ / / /  |/ / __  / __ \\/ __/');
  console.log('/ /_/ / /_/ / /|  / /_/ / /_/ / /_');
  console.log('\\____/_____/_/ |_/_____/\\____/\\__/');
  console.log(`Logged in as ${bot.user.tag}`);
  console.log('---:getin:---');
});

bot.on('message', (message) => {
  console.log(message.content);
});

bot.login(process.env.DISCORD_BOT_TOKEN);
