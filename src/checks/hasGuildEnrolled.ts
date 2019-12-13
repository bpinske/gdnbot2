import { oneLine } from 'common-tags';
import { Guild } from 'discord.js';

import logger, { LogTag } from '../helpers/logger';
import { axiosGDN, GDN_URLS, APIGuild } from '../helpers/axiosGDN';

const reasonNotEnrolled = oneLine`
  This server is not enrolled in the Goon Discord Network. Please have an
  admin enroll the server and then enable auth.
`;

export interface GuildEnrolled {
  isEnrolled: boolean;
  reason: string;
  guildData?: APIGuild;
}

/**
 * Check to see if a guild is enrolled in Goon Discord Network
 */
export default async function hasGuildEnrolled (tag: LogTag, guild: Guild): Promise<GuildEnrolled> {
  logger.info(tag, 'Checking if guild has enrolled in GDN');

  try {
    // Not erroring out here means the server is in GDN
    const { data } = await axiosGDN.get<APIGuild>(`${GDN_URLS.GUILDS}/${guild.id}`);

    logger.info(tag, 'Server is enrolled in GDN, continuing');

    return {
      isEnrolled: true,
      reason: 'OK',
      guildData: data,
    };
  } catch (err) {
    const { response } = err;

    if (response?.status === 404) {
      logger.info(tag, '...but no server info was found, exiting');
      return {
        isEnrolled: false,
        reason: reasonNotEnrolled,
      };
    } else {
      logger.error({ ...tag, err }, 'Error checking for server info, exiting');
      throw err;
    }
  }
}
