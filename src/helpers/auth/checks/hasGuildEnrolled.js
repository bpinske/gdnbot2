const { oneLine } = require('common-tags');

const {
  logger,
  axiosGDN,
  GDN_URLS
} = require('../../');

const reasonNotEnrolled = oneLine`
  This server is not enrolled in the Goon Discord Network. Please have an
  admin enroll the server and then activate auth.
`;

const reasonCatchError = oneLine`
  A system error occurred while attempting to verify guild enrollment in GDN. The bot owner has
  been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Check to see if a guild is enrolled in Goon Discord Network
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Guild} guild - The guild to verify enrollment in GDN
 * @returns {object} - { isEnrolled, reason, roleId, channelId }
 */
const hasGuildEnrolled = async ({ tag, guild }) => {
  logger.info(tag, `Checking if guild ${guild.name} has enrolled in GDN`);

  try {
    // Not erroring out here means the server is in GDN
    const { data } = await axiosGDN.get(`${GDN_URLS.GUILDS}/${guild.id}`);

    logger.info(tag, 'Server is enrolled in GDN, continuing');

    return {
      isEnrolled: true,
      roleId: data.validated_role_id,
      channelId: data.logging_channel_id
    };
  } catch (err) {
    const { response } = err;

    if (response && response.status === 404) {
      logger.info(tag, '...but no server info was found, exiting');
      return {
        isEnrolled: false,
        reason: reasonNotEnrolled
      };
    } else {
      logger.error({ ...tag, err }, 'Error checking for server info, exiting');
      return {
        isEnrolled: false,
        reason: reasonCatchError
      };
    }
  }
};

module.exports = hasGuildEnrolled;
