import { GuildMember } from 'discord.js';

import logger, { LogTag } from '../helpers/logger';
import isMemberBlacklisted from './isMemberBlacklisted';
import hasUserAuthed from './hasUserAuthed';

interface MemberAuth {
  canAuth: boolean;
  reason?: string;
  alreadyAuthed?: boolean;
  saUsername?: string;
}

/**
 * Check to see if a member has authed before in Goon Discord Network
 */
export default async function canMemberAuth (
  tag: LogTag,
  member: GuildMember,
  isAuthMe: boolean,
): Promise<MemberAuth> {
  let alreadyAuthed = false;

  /**
   * CHECK IF USER HAS AUTHED BEFORE
   */
  const {
    hasAuthed,
    reason: hasAuthedReason,
    data: dataGDN,
  } = await hasUserAuthed({ tag, member });

  // An error reason was returned
  if (hasAuthedReason) {
    return {
      canAuth: false,
      reason: hasAuthedReason,
    };
  }

  if (!hasAuthed) {
    if (isAuthMe) {
      logger.info(tag, 'Member can proceed with !authme');
      return {
        canAuth: true,
      };
    }

    logger.info(tag, 'Member cannot proceed with auto-auth');
    return {
      canAuth: false,
      reason: 'Cancelling auto-auth',
    };
  }

  alreadyAuthed = true;

  /**
   * CHECK IF AUTHED USER IS BLACKLISTED
   */
  const {
    sa_id: saID,
    sa_username: saUsername,
  } = dataGDN;
  const { isBlacklisted, reason: blacklistedReason } = await isMemberBlacklisted({ tag, saID });

  if (isBlacklisted) {
    return {
      canAuth: false,
      alreadyAuthed,
      reason: blacklistedReason,
    };
  }

  // User has passed all of the auth checks, so allow them to auth if they haven't already
  logger.info(tag, 'Member is OK to auth');
  return {
    canAuth: true,
    alreadyAuthed,
    saUsername,
  };
}
