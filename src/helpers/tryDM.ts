import { GuildMember, Message } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';

import logger, { LogTag } from './logger';
import { API_ERROR } from './constants';
import { stripIndents } from 'common-tags';

/**
 * Intercept a failed DM and redirect it to a guild channel instead (API error code 50007)
 *
 * This should help pass along info to users that have toggled off "Allow direct messages from
 * server members" from their account-wide or server-specific privacy settings.
 *
 * If no CommandoMessage is passed in as a fallback, the DM will be dropped.
 */
export default async function tryDM (
  tag: LogTag,
  text: string,
  member: GuildMember,
  message?: CommandoMessage,
): Promise<Message | null> {
  logger.info(tag, 'Trying to DM user');
  logger.debug({ ...tag, text });

  try {
    await member.send(text);
    logger.info(tag, 'Successfully sent DM');
  } catch (err) {
    if (err.code === API_ERROR.CANNOT_MESSAGE_USER) {
      if (message) {
        logger.info(tag, 'Could not DM, falling back to channel message');

        return message.reply(stripIndents`
          your Privacy Settings prevented me from sending you the following DM:

          >>> ${text}
        `);
      } else {
        logger.info(tag, 'No message specified for fallback, dropping DM');
      }
    } else {
      logger.error({ ...tag, err }, 'Could not DM user');
      throw err;
    }
  }

  return null;
}
