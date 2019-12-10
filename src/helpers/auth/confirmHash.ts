import { oneLine } from 'common-tags';

import { axiosGoonAuth, GOON_AUTH_URLS, APIConfirmHash } from '../axiosGoonAuth';
import logger, { LogTag } from '../logger';
import { GuildMember } from 'discord.js';

interface ConfirmedHash {
  confirmed: boolean;
  reason?: string;
}

function reasonNotValidated (username: string): string {
  return oneLine`
    Lowtax is disappointed in you. Enter **!authme ${username}** back in the server to try again
    :getout:
  `;
}

const errorNoValidate = oneLine`
  A system error occurred while confirming the hash's existence in your SA profile. The bot owner
  has been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Confirm via GoonAuth that the user placed the hash in their profile
 */
export default async function confirmHash (tag: LogTag, member: GuildMember, username: string): Promise<ConfirmedHash> {
  try {
    logger.info(tag, 'Confirming hash placement in SA profile');
    const { data } = await axiosGoonAuth.post<APIConfirmHash>(GOON_AUTH_URLS.CONFIRM_HASH, { username });
    const { validated } = data;

    if (!validated) {
      logger.warn(tag, 'Hash not found');
      return {
        confirmed: false,
        reason: reasonNotValidated(username),
      };
    }

    logger.info(tag, 'Hash confirmed');
    return {
      confirmed: true,
    };
  } catch (err) {
    logger.error({ ...tag, err }, 'Error confirming hash');
    return {
      confirmed: false,
      reason: errorNoValidate,
    };
  }
}
