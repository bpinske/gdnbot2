const { oneLine } = require('common-tags');

const logger = require('../helpers/logger');
const { axiosGDN, GDN_URLS } = require('../helpers/axiosGDN');

const reasonBlacklisted = oneLine`
  You are blacklisted from the Goon Discord Network. You may appeal this decision here:
  https://discord.gg/vH8uVUE
`;

const reasonCatchError = oneLine`
  A system error occurred while attempting to verify whether you are blacklisted from GDN. The bot
  owner has been notified. Thank you for your patience while they get this fixed!
`;

/**
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {string} saID - The user's SA ID
 * @returns {object} - { isBlacklisted, reason? }
 */
const isMemberBlacklisted = async ({ tag, saID }) => {
  logger.info(tag, 'Checking if member is blacklisted by SA ID');
  try {
    const { data } = await axiosGDN.get(`${GDN_URLS.SA}/${saID}`);

    if (data.blacklisted) {
      logger.warn(tag, 'Member is BLACKLISTED, ignoring');
      return {
        isBlacklisted: true,
        reason: reasonBlacklisted
      };
    }

    logger.info(tag, 'Member is not blacklisted');
    return {
      isBlacklisted: false
    };
  } catch (err) {
    const { response } = err;

    if (response && response.status === 404) {
      logger.info(tag, 'SA ID has not been used to auth before');
      return {
        isBlacklisted: false
      };
    }

    logger.error({ ...tag, err }, 'Error checking if member is blacklisted');
    return {
      isBlacklisted: true,
      reason: reasonCatchError
    };
  }
};

module.exports = isMemberBlacklisted;
