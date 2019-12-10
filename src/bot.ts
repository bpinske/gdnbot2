// Load files from the .env file
import dotenv from 'dotenv';

import { CommandoClient, SQLiteProvider } from 'discord.js-commando';
import sqlite from 'sqlite';
import path from 'path';

import logger from './helpers/logger';

// Event handlers
import autoAuth from './eventHandlers/autoAuth';
import updateServerCountActivity from './eventHandlers/updateServerCountActivity';
import { updateHomepageMemberCounts, UPDATE_INTERVAL } from './eventHandlers/updateHomepageMemberCounts';

dotenv.config();

// Create the bot as a Commando client
const bot = new CommandoClient({
  commandPrefix: '!',
  owner: '148474055949942787',
  invite: 'https://discord.gg/vH8uVUE',
  disabledEvents: [
    'TYPING_START',
  ],
});

// Set up a SQLite DB to preserve guide-specific command availability
sqlite.open(path.join(__dirname, '../settings.db'))
  .then(db => bot.setProvider(new SQLiteProvider(db)))
  .catch(error => { logger.error('Error loading SQLite DB:', error); });

// Initialize commands and command groups
bot.registry
  .registerDefaultTypes()
  .registerGroups([
    ['auth', 'Authentication'],
    ['gdn', 'Goon Discord Network'],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
  })
  // Automatically load commands that exist in the commands/ directory
  // A custom filter is specified so that the `require-all` library picks up .ts files during dev
  .registerCommandsIn({
    dirname: path.join(__dirname, 'commands'),
    filter: /^([^.].*)\.[jt]s$/,
  });

// Announce the bot's readiness to serve
bot.once('ready', () => {
  /* eslint-disable no-useless-escape */
  logger.info('   __________  _   ______        __');
  logger.info('  / ____/ __ \/ | / / __ )____  / /_');
  logger.info(' / / __/ / / /  |/ / __  / __ \/ __/');
  logger.info('/ /_/ / /_/ / /|  / /_/ / /_/ / /_');
  logger.info('\____/_____/_/ |_/_____/\____/\__/');
  logger.info(`Logged in as ${bot.user.tag}`);
  logger.info('---:getin:---');
  /* eslint-enable no-useless-escape */

  bot.user.setActivity('in the forge');

  // Update bot activity to reflect number of guilds
  updateServerCountActivity(bot);
  // Update homepage server counts on boot
  updateHomepageMemberCounts(bot);
});

// Handle errors
bot.on('error', (err) => {
  if (err.message === 'Cannot read property \'trim\' of undefined') {
    // Swallow a bug in discord.js-commando at:
    // node_modules/discord.js-commando/src/extensions/message.js:109:28
  } else {
    logger.error(err, 'Bot system error');
  }
});

/**
 * Event Handlers
 */

// When the bot joins a Guild
bot.on('guildCreate', () => {
  updateServerCountActivity(bot);
});

// When the bot leaves a Guild
bot.on('guildDelete', () => {
  updateServerCountActivity(bot);
});

// When a Member joins a Guild
bot.on('guildMemberAdd', autoAuth);

// Update server member counts on the GDN Homepage
bot.setInterval(
  () => {
    updateHomepageMemberCounts(bot);
  },
  UPDATE_INTERVAL,
);

// Start the bot
bot.login(process.env.DISCORD_BOT_TOKEN);