const logger = require('../logger');

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
 * @returns {object} - { canProceed, validatedRole, loggingChannel}
 */
const startAuthCheck = ({ tag, guild, member, isAuthMe }) => {
  logger.info(tag, 'Beginning auth checks');
  // - Ensure that server is in GDN
  //   - Alert user (if invoked via !authme)

  // - Ensure by Discord ID that user has authed before
  //   - GET /gdn/members/{Discord member id} === 200

  // - Ensure by SA ID that user has not been blacklisted
  //   - GET /gdn/sa/{SA ID stored in DB for Discord member ID above} => resp.blacklisted !== true
  //     - A little complex, but since a single SA ID can be used for multiple Discord accounts, we have to do this
  //   - Alert user (if invoked via !authme)

  // - Ensure that server has specified a role for auth'd users
  //   - Verify that role still exists
  //     - Alert user (if invoked via !authme) that authme is enabled but no valid role is specified

  // - Check for (optional) logging channel and verify its validity

  // - Authenticate user
  //   - Give role
  //   - Log to logging channel

  // - Tell user they've been automatically auth'd

  return {
    canProceed: false,
    validatedRole: null,
    loggingChanne: null
  };
};

module.exports = startAuthCheck;
