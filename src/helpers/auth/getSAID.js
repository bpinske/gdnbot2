const cheerio = require('cheerio');
const { oneLine } = require('common-tags');

const logger = require('../logger');
const { axiosSA, SA_URLS } = require('../axiosSA');

const reasonNoIDFound = oneLine`
  I could not find an ID on the SA profile page for the username you provided. The bot owner has
  been notified. Thank you for your patience while they get this fixed!
`;

const reasonCatchError = oneLine`
  A system error occurred while attempting to retrieve your account ID. The bot owner has been
  notified. Thank you for your patience while they get this fixed!
`;

/**
 * Scrape the user's SA profile for their SA ID
 *
 * This will get called _after_ the hash has been successfully verified, which means we're
 * assuming the username is valid.
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {string} username - The member's SA Username
 * @return {object} - { id }
 */
async function getSAID ({ tag, username }) {
  logger.info(tag, 'Retrieving SA ID from SA profile');

  const url = `${SA_URLS.PROFILE}${encodeURIComponent(username)}`;

  try {
    // Request HTML
    const resp = await axiosSA.get(url);
    // Prepare to parse it
    const $ = cheerio.load(resp.data);
    // Try to grab the ID
    const id = $('input[name="userid"]').val();

    /**
     * Note to self: If no ID is returned, then perhaps:
     *
     * 1) the cookies above are invalid (maybe the account is banned)
     * 2) Something about the profile page HTML changed
     * 3) Maybe the username WAS mis-spelled
     */
    if (!id) {
      logger.error(tag, `No user ID was found on ${url}`);
      return {
        id: null,
        reason: reasonNoIDFound
      };
    }

    logger.info(tag, `Found SA ID: ${id}`);
    return {
      id
    };
  } catch (err) {
    logger.error({ ...tag, err }, 'System error retrieving SA user ID');
    return {
      id: null,
      reason: reasonCatchError
    };
  }
}

module.exports = getSAID;
