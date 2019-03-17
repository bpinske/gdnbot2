// Load files from the .env file
require('dotenv').config();

const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');

const logger = require('./helpers/logger');

// Auth event handlers
const guildMemberAddAuth = require('./helpers/auth/guildMemberAdd');

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
    .catch(error => { logger.error('Error loading SQLite DB:', error); })
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
  logger.info('   __________  _   ______        __');
  logger.info('  / ____/ __ \\/ | / / __ )____  / /_');
  logger.info(' / / __/ / / /  |/ / __  / __ \\/ __/');
  logger.info('/ /_/ / /_/ / /|  / /_/ / /_/ / /_');
  logger.info('\\____/_____/_/ |_/_____/\\____/\\__/');
  logger.info(`Logged in as ${bot.user.tag}`);
  logger.info('---:getin:---');

  bot.user.setActivity('in the forge');
});

// Handle errors
bot.on('error', logger.error);

// Individual Event Handlers
bot.on('guildMemberAdd', guildMemberAddAuth);

// Start the bot
bot.login(process.env.DISCORD_BOT_TOKEN);
