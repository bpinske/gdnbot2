const { oneLine } = require('common-tags');

const logger = require('../logger');

const reasonNoIDFound = oneLine`
  I could not find an ID on the SA profile page for the username you provided. The bot owner has
  been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Scrape the user's SA profile for their SA ID
 *
 * This will get called _after_ the hash has been successfully verified, which means we're
 * assuming the username is valid.
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {CheerioElement} profile - The user's profile page HTML wrapped in Cheerio
 * @return {object} - { id }
 */
async function getSAID ({ tag, profile }) {
  logger.info(tag, 'Retrieving SA ID from SA profile');

  // Prepare to parse it
  const $ = profile;
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
    logger.error(tag, `No user ID was found`);
    return {
      id: null,
      reason: reasonNoIDFound
    };
  }

  logger.info(tag, `Found SA ID: ${id}`);
  return {
    id
  };
}

module.exports = getSAID;
