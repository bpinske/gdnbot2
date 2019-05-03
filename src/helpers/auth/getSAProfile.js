const cheerio = require('cheerio');
const { oneLine } = require('common-tags');

const logger = require('../logger');
const { axiosSA, SA_URLS } = require('../axiosSA');

const reasonErrorLoadingProfile = oneLine`
  A system error occurred while reading your SA profile. The bot owner has been notified. Thank
  you for your patience while they get this fixed!
`;

/**
 * Grab the user's SA Profile page and wrap it in Cheerio
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {string} username - The member's SA Username
 * @returns {CheerioElement} - { profile, reason? }
 */
const getSAProfile = async ({ tag, username }) => {
  logger.info(tag, 'Retrieving SA profile page');

  const url = `${SA_URLS.PROFILE}${encodeURIComponent(username)}`;

  try {
    // Request HTML
    const resp = await axiosSA.get(url);
    // Wrap it in Cheerio for easy traversal
    const profile = cheerio.load(resp.data);

    return {
      profile
    };
  } catch (err) {
    logger.error({ ...tag, err }, 'Error retrieving SA profile page');
    return {
      profile: null,
      reason: reasonErrorLoadingProfile
    };
  }
};

module.exports = getSAProfile;
