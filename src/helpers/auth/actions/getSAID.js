const axios = require('axios');
const cheerio = require('cheerio');
const { oneLine } = require('common-tags');

const logger = require('../../logger');

const PROFILE_URL = 'http://forums.somethingawful.com/member.php?action=getinfo&username=';

const COOKIES = {
  sessionid: '87654063',
  sessionhash: '6cd7e0953b0c6cd47ac6860ce6271d87',
  bbuserid: '186135',
  bbpassword: 'e6cf0cd6bc8218c6a361755d76deae38'
};

// Format the above cookies into a value suitable for use as the Cookie header
const Cookie = Object.entries(COOKIES).map(([key, val]) => `${key}=${val}`).join('; ');

// Prepare an Axios client with SA user cookies
const saScraper = axios.create({
  headers: {
    Cookie
  }
});

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
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {string} username - The member's SA Username
 * @return {object} - { id }
 */
async function getSAID ({ tag, username }) {
  logger.info(tag, `Finding user ID for SA user ${username}`);

  const url = `${PROFILE_URL}${username}`;

  try {
    // Request HTML
    const resp = await saScraper.get(url);
    // Prepare to parse it
    const $ = cheerio.load(resp.data);
    // Try to grab the ID
    const id = $('input[name="userid"]').val();

    if (!id) {
      logger.error(tag, `No user ID was found on ${url}`);
      return {
        id: null,
        reason: reasonNoIDFound
      };
    }

    logger.info(tag, `Found user ID: ${id}`);
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
