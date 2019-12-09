const { SnowflakeUtil } = require('discord.js');

const logger = require('../helpers/logger');
const { axiosGDN, GDN_URLS } = require('../helpers/axiosGDN');

const UPDATE_INTERVAL = 1000 * 60 * 60 * 24; // 24 Hours

const updateHomepageMemberCounts = async ({ bot }) => {
  // Generate a logger tag
  const eventId = SnowflakeUtil.generate();
  const tag = logger.getLogTag(eventId);

  logger.info(tag, '[Updating member counts]');

  try {
    // Get the servers from the back end and map them by server ID
    const resp = await axiosGDN(GDN_URLS.GUILDS);
    const apiGuilds = resp.data;
    const guildsMap = {};
    apiGuilds.forEach(guild => {
      guildsMap[guild.server_id] = guild;
    });

    // Go through each Guild and attempt to count the number of authed Members
    bot.guilds.each(async (guild) => {
      // Grab the auth role ID registered with the backend
      const authedRoleID = guildsMap[guild.id].validated_role_id;

      let authedUsers;
      let message;
      if (!authedRoleID) {
        // Auth wasn't set up here, so just return the total number of Members
        authedUsers = guild.members;
        message = `Updating total member count for ${guild.name} (${guild.id}): ${authedUsers.size}`;
      } else {
        // Go through each Member and filter for ones that have the Guild's auth role
        authedUsers = guild.members.filter(
          member => member.roles.some(role => role.id === authedRoleID),
        );
        message = `Updating authed member count for ${guild.name} (${guild.id}): ${authedUsers.size}`;
      }

      logger.info(tag, message);

      // Patch the server count
      try {
        let count = authedUsers.size;
        // Round down to the nearest 10s place
        if (count > 10) {
          count = count - (count % 10);
        }

        logger.debug(tag, `Rounded user count: ${count}`);

        await axiosGDN.patch(`${GDN_URLS.GUILDS}/${guild.id}`, {
          user_count: count,
        });

        logger.info(tag, 'Successfully updated guild member count on server');
      } catch (err) {
        logger.error({ ...tag, err }, 'Error sending updated count to server');
      }
    });
  } catch (err) {
    logger.error({ ...tag, err }, 'Error updating server member counts');
  }
};

module.exports = {
  updateHomepageMemberCounts,
  UPDATE_INTERVAL,
};
