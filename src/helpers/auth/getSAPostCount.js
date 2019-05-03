const { oneLine } = require('common-tags');

const logger = require('../logger');

const postCountRegEx = /been (\d+) posts/i;

const reasonNoPostCountFound = oneLine`
  I could not find a post count on the SA profile page for the username you provided. The bot
  owner has been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Scrape the user's SA profile for their SA post count
 *
 * This will get called _after_ the hash has been successfully verified, which means we're
 * assuming the username is valid.
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {CheerioElement} profile - The user's profile page HTML wrapped in Cheerio
 * @return {object} - { count, reason? }
 */
async function getSAPostCount ({ tag, profile }) {
  logger.info(tag, 'Retrieving post count from SA profile');

  // Prepare to parse it
  const $ = profile;

  // Try to grab the post count
  const profileInfo = $('td.info p').text();
  const match = profileInfo.match(postCountRegEx);

  /**
   * Note to self: If no post count is found, then perhaps:
   *
   * 1) the cookies above are invalid (maybe the account is banned)
   * 2) Something about the profile page HTML changed
   * 3) Maybe the username WAS mis-spelled
   */
  if (!match) {
    logger.error(tag, 'No post count was found');
    return {
      count: -1,
      reason: reasonNoPostCountFound
    };
  }

  const count = parseInt(match[1], 10);

  logger.info(tag, `Found post count: ${count}`);
  return {
    count
  };
}

module.exports = getSAPostCount;
