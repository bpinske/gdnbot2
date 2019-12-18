import { CommandoMessage } from 'discord.js-commando';

import logger, { LogTag } from './logger';

/**
 * Help ensure consistent logging at the beginning of a command's execution
 */
export default function logCommandStart (tag: LogTag, message: CommandoMessage): void {
  const { command, client, guild, member } = message;
  const { commandPrefix } = client;

  logger.info(tag, `[EVENT START: ${commandPrefix}${command.name}]`);

  logger.debug(tag, `Called by ${member.user.tag} (${member.id}) in ${guild.name} (${guild.id})`);
}
