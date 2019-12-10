import { oneLine } from 'common-tags';

import logger, { LogTag } from '../helpers/logger';
import { axiosGDN, GDN_URLS, APIMember } from '../helpers/axiosGDN';

interface MemberBlacklisted {
  isBlacklisted: boolean;
  reason?: string;
}

const reasonBlacklisted = oneLine`
  You are blacklisted from the Goon Discord Network. You may appeal this decision here:
  https://discord.gg/vH8uVUE
`;

const reasonCatchError = oneLine`
  A system error occurred while attempting to verify whether you are blacklisted from GDN. The bot
  owner has been notified. Thank you for your patience while they get this fixed!
`;

/**
 * Check if a given SA ID is blacklisted on any Discord accounts that it's been used with
 */
export default async function isMemberBlacklisted (tag: LogTag, saID: string): Promise<MemberBlacklisted> {
  logger.info(tag, `Checking if member SA ID is blacklisted: ${saID}`);
  try {
    const { data } = await axiosGDN.get<APIMember>(`${GDN_URLS.SA}/${saID}`);

    if (data.blacklisted) {
      logger.warn(tag, 'Member is BLACKLISTED, ignoring');
      return {
        isBlacklisted: true,
        reason: reasonBlacklisted,
      };
    }

    logger.info(tag, 'Member is not blacklisted');
    return {
      isBlacklisted: false,
    };
  } catch (err) {
    const { response } = err;

    if (response && response.status === 404) {
      logger.info(tag, 'SA ID is not associated with a blacklisted user');
      return {
        isBlacklisted: false,
      };
    }

    logger.error({ ...tag, err }, 'Error checking if member is blacklisted');
    return {
      isBlacklisted: true,
      reason: reasonCatchError,
    };
  }
}
