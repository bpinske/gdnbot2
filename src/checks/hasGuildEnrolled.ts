import { oneLine } from 'common-tags';
import { Guild } from 'discord.js';

import logger, { LogTag } from '../helpers/logger';
import { axiosGDN, GDN_URLS, GuildByIdResponse } from '../helpers/axiosGDN';

const reasonNotEnrolled = oneLine`
  This server is not enrolled in the Goon Discord Network. Please have an
  admin enroll the server and then activate auth.
`;

const reasonCatchError = oneLine`
  A system error occurred while attempting to verify guild enrollment in GDN. The bot owner has
  been notified. Thank you for your patience while they get this fixed!
`;

export interface GuildEnrolled {
  isEnrolled: boolean;
  reason: string;
  roleId?: string;
  channelId?: string;
}

/**
 * Check to see if a guild is enrolled in Goon Discord Network
 */
export default async function hasGuildEnrolled (tag: LogTag, guild: Guild): Promise<GuildEnrolled> {
  logger.info(tag, 'Checking if guild has enrolled in GDN');

  try {
    // Not erroring out here means the server is in GDN
    const { data }: GuildByIdResponse = await axiosGDN.get(`${GDN_URLS.GUILDS}/${guild.id}`);

    logger.info(tag, 'Server is enrolled in GDN, continuing');

    return {
      isEnrolled: true,
      reason: 'OK',
      roleId: data.validated_role_id,
      channelId: data.logging_channel_id,
    };
  } catch (err) {
    const { response } = err;

    if (response && response.status === 404) {
      logger.info(tag, '...but no server info was found, exiting');
      return {
        isEnrolled: false,
        reason: reasonNotEnrolled,
      };
    } else {
      logger.error({ ...tag, err }, 'Error checking for server info, exiting');
      return {
        isEnrolled: false,
        reason: reasonCatchError,
      };
    }
  }
}
