const logger = require('../helpers/logger');

/**
 * Set the bot's activity to show the number of servers it's sitting in
 *
 * @param {Client} bot
 */
const updateServerCountActivity = async ({ bot }) => {
  const activity = `in ${bot.guilds.size} servers`;

  logger.info(`setting activity to "${activity}"`);

  await bot.user.setActivity(activity);
};

module.exports = updateServerCountActivity;
