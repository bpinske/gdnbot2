import { oneLine } from 'common-tags';

import { axiosGoonAuth, GOON_AUTH_URLS } from '../axiosGoonAuth';
import logger, { LogTag } from '../logger';
import { GuildMember } from 'discord.js';

interface Hash {
  hash?: string;
  reason?: string;
}

const errorNoHash = oneLine`
  A system error occurred while generating a hash to help you to verify your SA membership.
  The bot owner has been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Get a hash from GoonAuth for the user to place in their SA profile
 */
export default async function getHash (tag: LogTag, member: GuildMember, username: string): Promise<Hash> {
  try {
    logger.info(tag, `Requesting hash for SA user: ${username}`);
    const { data } = await axiosGoonAuth.post(GOON_AUTH_URLS.GET_HASH, { username });
    return {
      hash: data.hash,
    };
  } catch (err) {
    logger.error({ ...tag, err }, 'Error requesting hash');
    return {
      hash: null,
      reason: errorNoHash,
    };
  }
}
