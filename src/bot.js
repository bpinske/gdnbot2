// Load files from the .env file
require('dotenv').config();

const { Client, Collection } = require('discord.js');

const loadExtensions = require('./helpers/loadExtensions');
const { prefix } = require('./helpers/constants');

const bot = new Client();
bot.commands = new Collection();

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
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (!bot.commands.has(command)) {
    message.reply(`${command} is not a valid command`);
    return;
  }

  try {
    bot.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('Hmm, I encountered an error when I tried to execute that command');
  }
});

// Initialize any extensions
loadExtensions(bot);

bot.login(process.env.DISCORD_BOT_TOKEN);
