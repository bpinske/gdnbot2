const { oneLine } = require('common-tags');

const logger = require('../helpers/logger');
const { GDN_URLS, axiosGDN } = require('../helpers/axiosGDN');

const reasonCatchError = oneLine`
  A system error occurred while attempting to verify if you had authed before. The bot
  owner has been notified. Thank you for your patience while they get this fixed!
`;

/**
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} member - The member that may have authed
 * @returns {object} - { hasAuthed, reason?, data? }
 */
const hasMemberAuthed = async ({ tag, member }) => {
  logger.info(tag, 'Checking to see if Member has authed before');

  const { id } = member;

  try {
    // No error here means the user exists in the DB
    const resp = await axiosGDN.get(`${GDN_URLS.MEMBERS}/${id}`);
    logger.info(tag, 'Member has authed before');
    return {
      hasAuthed: true,
      data: resp.data
    };
  } catch (err) {
    const { response } = err;

    if (response && response.status === 404) {
      logger.warn(tag, 'Member has not authed before');
      return {
        hasAuthed: false
      };
    }

    logger.error({ ...tag, err }, 'Error checking if member has authed');
    return {
      hasAuthed: false,
      reason: reasonCatchError
    };
  }
};

module.exports = hasMemberAuthed;
