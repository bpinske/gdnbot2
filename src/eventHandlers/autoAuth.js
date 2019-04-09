const { SnowflakeUtil } = require('discord.js');

const logger = require('../helpers/logger');

const startAuthCheck = require('../helpers/auth/startAuthCheck');
const addRoleAndLog = require('../helpers/auth/actions/addRoleAndLog');

/**
 * A handler for the "guildMemberAdd" event, when a member joins a server the bot is on
 */
const autoAuth = (member) => {
  const { guild } = member;

  // Generate a snowflake since we won't get one here from Discord
  const eventId = SnowflakeUtil.generate();
  // Generate a logging tag with the snowflake
  const tag = logger.getLogTag(eventId);

  logger.info(tag, `[EVENT: User joined ${guild.name}]`);

  // Wait a second before proceeding with auto-auth
  setTimeout(async () => {
    const {
      canProceed,
      saUsername,
      validatedRole,
      validatedChannel
    } = await startAuthCheck({ tag, guild, member, isAuthMe: false });

    if (canProceed) {
      addRoleAndLog({
        tag,
        member,
        saUsername,
        role: validatedRole,
        channel: validatedChannel
      });
    } else {
      logger.info(tag, 'Did not proceed with auto-auth');
    }
  }, 1000);
};

module.exports = autoAuth;
