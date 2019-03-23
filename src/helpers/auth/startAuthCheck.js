const {
  logger
} = require('../');

const hasGuildEnrolled = require('./checks/hasGuildEnrolled');
const canMemberAuth = require('./checks/canMemberAuth');
const isValidAuthRole = require('./checks/isValidAuthRole');
const isValidLogChannel = require('./checks/isValidLogChannel');

/**
 * A series of checks to perform any time an intent to authenticate is registered
 *
 * An "intent to authenticate" can be one of the following scenarios:
 *
 * - User invokes !authme
 * - User joins a server in which GDNBot resides
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Guild} guild - The server the user is in
 * @param {Member} member - The member to auth
 * @param {boolean} isAuthMe - Whether this was invoked from !authme, or by the member joining
 * @returns {object} - { canProceed, reason?, validatedRole, loggingChannel }
 */
const startAuthCheck = async ({ tag, guild, member, isAuthMe }) => {
  logger.info(
    tag,
    `Beginning auth checks for ${member.name} (${member.id}) in ${guild.name} (${guild.id})`
  );

  /**
   * Ensure that server is in GDN
   */
  const {
    isEnrolled,
    reason: guildReason,
    roleId,
    channelId
  } = await hasGuildEnrolled({ tag, guild });

  if (!isEnrolled) {
    return {
      canProceed: false,
      reason: guildReason
    };
  }

  /**
   * Check that member can proceed with authentication
   */
  const {
    canAuth,
    reason: memberAuthReason
  } = await canMemberAuth({ tag, member });

  if (!canAuth) {
    return {
      canProceed: false,
      reason: memberAuthReason
    };
  }

  /**
   * Ensure that server has specified a role for auth'd users
   */
  const {
    isValid: isValidRole,
    reason: roleReason,
    validatedRole
  } = isValidAuthRole({ tag, guild, roleId });

  if (!isValidRole) {
    return {
      canProceed: false,
      reason: roleReason
    };
  }

  /**
   * Check for (optional) logging channel and validate it
   */
  const {
    validatedChannel
  } = isValidLogChannel({ tag, guild, channelId });

  return {
    canProceed: true,
    validatedRole,
    validatedChannel
  };
};

module.exports = startAuthCheck;
