import { SnowflakeUtil, Collection, GuildMember } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';

import logger, { getLogTag } from '../helpers/logger';
import { axiosGDN, GDN_URLS, APIGuild } from '../helpers/axiosGDN';
import roundDown from '../helpers/roundDown';

interface GuildsMap {
  [guildId: string]: APIGuild;
}

export const UPDATE_INTERVAL = 1000 * 60 * 60 * 24; // 24 Hours

export async function updateHomepageMemberCounts (bot: CommandoClient) {
  // Generate a logger tag
  const eventId = SnowflakeUtil.generate();
  const tag = getLogTag(eventId);

  logger.info(tag, '[Updating member counts]');

  try {
    // Get the list of enrolled servers from the back end
    const resp = await axiosGDN.get<APIGuild[]>(GDN_URLS.GUILDS);
    const apiGuilds = resp.data;
    // Map the servers by ID
    const guildsMap: GuildsMap = {};
    apiGuilds.forEach(guild => {
      guildsMap[guild.server_id] = guild;
    });

    // Go through each Guild and attempt to count the number of authed Members
    bot.guilds.each(async (guild) => {
      const subTag = { ...tag, guildID: guild.id };
      // Don't do anything if this guild isn't enrolled in GDN
      if (!guildsMap[guild.id]) {
        logger.debug(subTag, `${guild.name} not enrolled in GDN, ignoring`);
        return;
      }

      // Grab the auth role ID registered with the backend
      const authedRoleID = guildsMap[guild.id].validated_role_id;

      let authedUsers: Collection<string, GuildMember>;
      let message: string;
      if (!authedRoleID) {
        // Auth wasn't set up here, so just return the total number of Members
        authedUsers = guild.members;
        message = `Updating total member count for ${guild.name}: ${authedUsers.size}`;
      } else {
        // Go through each Member and filter for ones that have the Guild's auth role
        authedUsers = guild.members.filter(
          member => member.roles.some(role => role.id === authedRoleID),
        );
        message = `Updating authed member count for ${guild.name}: ${authedUsers.size}`;
      }

      logger.info(subTag, message);

      // Patch the server count
      try {
        const count = roundDown(authedUsers.size);

        logger.debug(subTag, `Rounded user count: ${count}`);

        await axiosGDN.patch(`${GDN_URLS.GUILDS}/${guild.id}`, {
          user_count: count,
        });

        logger.info(subTag, 'Successfully updated member count');
      } catch (err) {
        logger.error({ ...subTag, err }, 'Error sending updated count to server');
      }
    });
  } catch (err) {
    logger.error({ ...tag, err }, 'Error updating server member counts');
  }
}
