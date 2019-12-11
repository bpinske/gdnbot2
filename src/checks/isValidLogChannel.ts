import { Guild, TextChannel } from 'discord.js';

import logger, { LogTag } from '../helpers/logger';

interface ValidatedLogChannel {
  isValid: boolean;
  logChannel?: TextChannel;
}

/**
 * Try to find a logging channel matching the guild's authme logging channel ID
 */
export default async function isValidLogChannel (
  tag: LogTag,
  guild: Guild,
  channelId: string,
): Promise<ValidatedLogChannel> {
  let logChannel: TextChannel;
  let isValid = false;

  if (channelId) {
    // Convert to string in case we get a number
    const id = String(channelId);

    logger.info(tag, `Validating logging channel ID: '${id}'`);
    const textChannel = await guild.channels.get(id);

    if (textChannel?.type === 'text') {
      logger.info(tag, `Found valid text channel: '#${textChannel.name}'`);
      isValid = true;
      logChannel = (textChannel as TextChannel);
    } else {
      logger.info(tag, 'No text channel found by that ID');
    }
  } else {
    logger.info(tag, 'No channel ID provided');
  }

  return {
    isValid,
    logChannel,
  };
}
