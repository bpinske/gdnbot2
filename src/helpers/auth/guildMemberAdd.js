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

  logger.info(tag, `Member ${member.name} joined guild ${guild.name}`);

  // Wait a second before proceeding with auto-auth
  setTimeout(() => {
    startAuthCheck({ tag, guild, member, isAuthMe: false });
  }, 1000);
};

module.exports = guildMemberAdd;
