const { oneLine } = require('common-tags');

const {
  logger,
  axiosGDN,
  GDN_URLS
} = require('../../');

const reasonBlacklisted = oneLine`
  You are blacklisted from the Goon Discord Network. You may appeal this decision here:
  https://discord.gg/vH8uVUE
`;

const reasonCatchError = oneLine`
  An error occurred while attempting to verify that you can proceed with auth. The bot
  owner has been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Check to see if a member has authed before in Goon Discord Network
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} member - The member to verify enrollment in GDN
 * @returns {object} - { canAuth, reason? }
 */
const canMemberAuth = async ({ tag, member }) => {
  let dataGDN;

  logger.info(tag, `Checking if member ${member.name} has authed in GDN`);
  try {
    const resp = await axiosGDN.get(`${GDN_URLS.MEMBERS}/${member.id}`);
    dataGDN = resp.data;
    logger.info(tag, 'Member has authed in GDN');
  } catch (err) {
    const { response } = err;

    if (response && response.status === 404) {
      logger.info(tag, 'Member has not authed before, OK to auth');
      return {
        canAuth: true
      };
    } else {
      logger.error({ ...tag, err }, 'Error checking if member has authed');
      return {
        canAuth: false,
        reason: reasonCatchError
      };
    }
  }

  logger.info(tag, `Checking if member ${member.name} is blacklisted`);
  try {
    logger.info(tag, 'Requesting internal GDN member profile by SA ID');
    const { data } = await axiosGDN.get(`${GDN_URLS.SA}/${dataGDN.sa_id}`);

    if (data.blacklisted) {
      logger.warn(tag, 'Member has authed before but is BLACKLISTED, ignoring');
      return {
        canAuth: false,
        reason: reasonBlacklisted
      };
    }
  } catch (err) {
    logger.error({ ...tag, err }, 'Error checking if member is blacklisted');
    return {
      canAuth: false,
      reason: reasonCatchError
    };
  }

  // User has authed before and isn't blacklisted, so allow them to auth
  logger.info(tag, 'Member is not blacklisted, OK to auth');
  return {
    canAuth: true
  };
};

module.exports = canMemberAuth;
