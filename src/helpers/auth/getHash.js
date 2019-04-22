const { oneLine } = require('common-tags');

const { axiosGoonAuth, GOON_AUTH_URLS } = require('../axiosGoonAuth');
const logger = require('../logger');

const errorNoHash = oneLine`
  A system error occurred while generating a hash to help you to verify your SA membership.
  The bot owner has been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Get a hash from GoonAuth for the user to place in their SA profile
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} member - The Discord member attempting to auth
 * @param {string} username - The Discord member's SA username
 * @returns {object} - { hash, reason? }
 */
const getHash = async ({ tag, member, username }) => {
  try {
    logger.info(tag, `Requesting hash for SA user: ${username}`);
    const { data } = await axiosGoonAuth.post(GOON_AUTH_URLS.GET_HASH, { username });
    return {
      hash: data.hash
    };
  } catch (err) {
    logger.error({ ...tag, err }, 'Error requesting hash');
    return {
      hash: null,
      reason: errorNoHash
    };
  }
};

module.exports = getHash;
