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
  const { hasAuthed, reason: hasAuthedReason, data: dataGDN } = await hasUserAuthed({ tag, member });

  // An error reason was returned
  if (hasAuthedReason) {
    return {
      canAuth: false,
      reason: hasAuthedReason
    };
  }

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

  alreadyAuthed = true;

  /**
   * CHECK IF AUTHED USER IS BLACKLISTED
   */
  const saID = dataGDN.sa_id;
  const { isBlacklisted, reason: blacklistedReason } = await isMemberBlacklisted({ tag, saID });

  if (isBlacklisted) {
    return {
      canAuth: false,
      alreadyAuthed,
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
