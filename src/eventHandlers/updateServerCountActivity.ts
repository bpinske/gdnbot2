import { CommandoClient } from 'discord.js-commando';

import logger from '../helpers/logger';

/**
 * Set the bot's activity to show the number of servers it's sitting in
 *
 * @param {Client} bot
 */
const updateServerCountActivity = async (bot: CommandoClient) => {
  const activity = `in ${bot.guilds.size} servers`;

  logger.info(`setting activity to "${activity}"`);

  await bot.user?.setActivity(activity);
};

export default updateServerCountActivity;
