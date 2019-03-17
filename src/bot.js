// Load files from the .env file
require('dotenv').config();

const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');

// Create the bot as a Commando client
const bot = new CommandoClient({
  prefix: '!',
  owner: '148474055949942787',
  invite: 'https://discord.gg/vH8uVUE',
  unknownCommandResponse: false,
  disabledEvents: [
    'TYPING_START'
  ]
});

// Set up a SQLite DB to preserve guide-specific command availability
bot.setProvider(
  sqlite.open(path.join(__dirname, '../settings.db'))
    .then(db => new SQLiteProvider(db))
    .catch(error => { console.error('Error loading SQLite DB:', error); })
);

// Initialize commands and command groups
bot.registry
  .registerDefaultTypes()
  .registerGroups([
    ['auth', 'Authentication'],
    ['gdn', 'Goon Discord Network']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  // Automatically load commands that exist in the commands/ directory
  .registerCommandsIn(path.join(__dirname, 'commands'));

// Announce the bot's readiness to serve
bot.once('ready', () => {
  console.log('   __________  _   ______        __');
  console.log('  / ____/ __ \\/ | / / __ )____  / /_');
  console.log(' / / __/ / / /  |/ / __  / __ \\/ __/');
  console.log('/ /_/ / /_/ / /|  / /_/ / /_/ / /_');
  console.log('\\____/_____/_/ |_/_____/\\____/\\__/');
  console.log(`Logged in as ${bot.user.tag}`);
  console.log('---:getin:---');

  bot.user.setActivity('in the forge');
});

// Handle errors
// TODO: Use proper error logging here
bot.on('error', console.error);

// Start the bot
bot.login(process.env.DISCORD_BOT_TOKEN);
