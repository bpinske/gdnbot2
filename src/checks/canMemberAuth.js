const logger = require('../helpers/logger');
const isMemberBlacklisted = require('./isMemberBlacklisted');
const hasUserAuthed = require('./hasUserAuthed');

/**
 * Check to see if a member has authed before in Goon Discord Network
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} member - The member to verify enrollment in GDN
 * @returns {object} - { canAuth, reason?, alreadyAuthed?, saUsername? }
 */
const canMemberAuth = async ({ tag, member, isAuthMe }) => {
  let alreadyAuthed = false;

  /**
   * CHECK IF USER HAS AUTHED BEFORE
   */
  const { hasAuthed, dataGDN } = await hasUserAuthed({ tag, member });

  if (!hasAuthed) {
    if (isAuthMe) {
      logger.info(tag, 'Member can proceed with !authme');
      return {
        canAuth: true
      };
    }

    logger.info(tag, 'Member cannot proceed with auto-auth');
    return {
      canAuth: false,
      reason: 'Cancelling auto-auth'
    };
  }

  /**
   * CHECK IF AUTHED USER IS BLACKLISTED
   */
  const saID = dataGDN.sa_id;
  const { isBlacklisted, reason: blacklistedReason } = await isMemberBlacklisted({ tag, saID });

  if (isBlacklisted) {
    return {
      canAuth: false,
      reason: blacklistedReason
    };
  }

  // User has passed all of the auth checks, so allow them to auth if they haven't already
  logger.info(tag, 'Member is OK to auth');
  return {
    canAuth: true,
    alreadyAuthed,
    saUsername: dataGDN.sa_username
  };
};

module.exports = canMemberAuth;
