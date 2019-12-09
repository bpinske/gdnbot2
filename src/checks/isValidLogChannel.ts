import { Guild, GuildChannel } from 'discord.js';

import logger, { LogTag } from '../helpers/logger';

interface ValidatedLogChannel {
  isValid: boolean;
  guildChannel?: GuildChannel;
}

/**
 * Try to find a logging channel matching the guild's authme logging channel ID
 */
export default async function isValidLogChannel (
  tag: LogTag,
  guild: Guild,
  channelId: string,
): Promise<ValidatedLogChannel> {
  let guildChannel;
  let isValid = false;

  if (channelId) {
    // Convert to string in case we get a number
    const id = String(channelId);

    logger.info(tag, `Validating logging channel ID: '${id}'`);
    guildChannel = await guild.channels.get(id);

    if (guildChannel) {
      logger.info(tag, `Found valid channel: '#${guildChannel.name}'`);
      isValid = true;
    } else {
      logger.info(tag, 'No channel found by that ID');
    }
  } else {
    logger.info(tag, 'No channel ID provided');
  }

  return {
    isValid,
    guildChannel,
  };
}
