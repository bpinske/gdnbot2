const logger = require('../helpers/logger');

/**
 * Try to find a logging channel matching the guild's authme logging channel ID
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} guild - The guild whose roles will be searched
 * @param {string} channelId - The logging channel ID provided when auth was activated
 * @returns {object} - { validatedChannel }
 */
const isValidLogChannel = async ({ tag, guild, channelId }) => {
  let validatedChannel;

  if (channelId) {
    // Convert to string in case we get a number
    const id = String(channelId);

    logger.info(tag, `Validating logging channel ID: '${id}'`);
    validatedChannel = await guild.channels.get(id);

    if (validatedChannel) {
      logger.info(tag, `Found valid channel: '#${validatedChannel.name}'`);
    } else {
      logger.info(tag, 'No channel found by that ID');
    }
  } else {
    logger.info(tag, 'No channel ID provided');
  }

  return {
    validatedChannel
  };
};

module.exports = isValidLogChannel;
