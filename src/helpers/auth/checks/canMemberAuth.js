const { oneLine } = require('common-tags');

const logger = require('../../logger');
const { axiosGDN, GDN_URLS } = require('../../axiosGDN');
const isMemberBlacklisted = require('./isMemberBlacklisted');

const reasonCatchError = oneLine`
  A system error occurred while attempting to verify that you can proceed with auth. The bot
  owner has been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Check to see if a member has authed before in Goon Discord Network
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} member - The member to verify enrollment in GDN
 * @returns {object} - { canAuth, reason?, alreadyAuthed }
 */
const canMemberAuth = async ({ tag, member, isAuthMe }) => {
  let dataGDN;

  let alreadyAuthed = false;

  logger.info(tag, 'Checking if member has authed in GDN');
  try {
    const resp = await axiosGDN.get(`${GDN_URLS.MEMBERS}/${member.id}`);
    dataGDN = resp.data;

    logger.info(tag, 'Member has authed in GDN');

    alreadyAuthed = true;
  } catch (err) {
    const { response } = err;

    if (response && response.status === 404) {
      if (isAuthMe) {
        logger.info(tag, 'Member has not authed before and can proceed with !authme');
        return {
          canAuth: true
        };
      }

      logger.info(tag, 'Member has not authed before and so cannot proceed with auto-auth');
      return {
        canAuth: false,
        reason: 'Cancelling auto-auth'
      };
    }

    logger.error({ ...tag, err }, 'Error checking if member has authed');
    return {
      canAuth: false,
      reason: reasonCatchError
    };
  }

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
    alreadyAuthed
  };
};

module.exports = canMemberAuth;
