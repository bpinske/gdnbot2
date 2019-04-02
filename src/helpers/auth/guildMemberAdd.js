const { SnowflakeUtil } = require('discord.js');

const { logger } = require('../');
const startAuthCheck = require('./startAuthCheck');

/**
 * A handler for the "guildMemberAdd" event, when a member joins a server the bot is on
 */
const guildMemberAdd = (member) => {
  const { guild } = member;

  // Generate a snowflake since we won't get one here from Discord
  const eventId = SnowflakeUtil.generate();
  // Generate a logging tag with the snowflake
  const tag = logger.getLogTag(eventId);

  logger.info(tag, `EVENT: Member added to guild`);

  // Wait a second before proceeding with auto-auth
  setTimeout(async () => {
    const {
      canProceed
      // canProceed,
      // validatedRole,
      // validatedChannel
    } = await startAuthCheck({ tag, guild, member, isAuthMe: false });

    if (canProceed) {
      logger.info(tag, 'Automatically auth-ing user');
      // - Authenticate user
      //   - Give role
      //   - Log to logging channel

      // - Tell user they've been automatically auth'd
    } else {
      logger.info(tag, 'Did not proceed with auto-auth');
    }
  }, 1000);
};

module.exports = guildMemberAdd;
