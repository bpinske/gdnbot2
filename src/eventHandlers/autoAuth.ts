import { SnowflakeUtil, GuildMember } from 'discord.js';

import logger, { getLogTag } from '../helpers/logger';

import startAuthCheck from '../helpers/auth/startAuthCheck';
import addRoleAndLog from '../helpers/auth/addRoleAndLog';

/**
 * A handler for the "guildMemberAdd" event, when a member joins a server the bot is on
 */
export default function autoAuth (member: GuildMember) {
  const { guild } = member;

  // Generate a snowflake since we won't get one here from Discord
  const eventId = SnowflakeUtil.generate();
  // Generate a logging tag with the snowflake
  const tag = getLogTag(eventId);

  logger.info(tag, `[EVENT START: User joined ${guild.name}]`);

  // Wait a second before proceeding with auto-auth
  setTimeout(async () => {
    const {
      canProceed,
      saUsername,
      validatedRole,
      validatedChannel,
    } = await startAuthCheck(tag, guild, member, false);

    if (canProceed) {
      await addRoleAndLog(
        tag,
        member,
        // These values will always be defined by this point
        saUsername!,
        validatedRole!,
        validatedChannel,
      );
    } else {
      logger.info(tag, 'Did not proceed with auto-auth');
    }
  }, 1000);
}
