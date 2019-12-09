import { Guild, GuildMember, Role, Channel } from 'discord.js';

import logger, { LogTag } from '../logger';

import hasGuildEnrolled from '../../checks/hasGuildEnrolled';
import canMemberAuth from '../../checks/canMemberAuth';
import isValidAuthRole from '../../checks/isValidAuthRole';
import isValidLogChannel from '../../checks/isValidLogChannel';

interface AuthCheckDecision {
  canProceed: boolean;
  reason?: string;
  alreadyAuthed?: boolean;
  saUsername?: string;
  validatedRole: Role;
  loggingChannel: Channel;
}

/**
 * A series of checks to perform any time an intent to authenticate is registered
 *
 * An "intent to authenticate" can be one of the following scenarios:
 *
 * - User invokes !authme
 * - User joins a server in which GDNBot resides
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Guild} guild - The server the user is in
 * @param {Member} member - The member to auth
 * @param {boolean} isAuthMe - Whether this was invoked from !authme, or by the member joining
 * @returns {object} - { canProceed, reason?, alreadyAuthed?, saUsername?, validatedRole, loggingChannel }
 */
export default async function startAuthCheck (
  tag: LogTag,
  guild: Guild,
  member: GuildMember,
  isAuthMe: boolean,
): Promise<AuthCheckDecision> {
  logger.info(
    tag,
    `Beginning auth checks for ${member.user.tag} (${member.id}) in ${guild.name} (${guild.id})`,
  );

  /**
   * Ensure that server is in GDN
   */
  const {
    isEnrolled,
    reason: guildReason,
    roleId,
    channelId,
  } = await hasGuildEnrolled({ tag, guild });

  if (!isEnrolled) {
    logger.info(tag, 'Guild is not enrolled, exiting');
    return {
      canProceed: false,
      reason: guildReason,
    };
  }

  /**
   * Check that member can proceed with authentication
   */
  const {
    canAuth,
    reason: memberAuthReason,
    alreadyAuthed,
    saUsername,
  } = await canMemberAuth({ tag, member, isAuthMe });

  if (!canAuth) {
    logger.info(tag, 'Member cannot proceed with auth, exiting');
    return {
      canProceed: false,
      reason: memberAuthReason,
    };
  }

  /**
   * Ensure that server has specified a role for auth'd users
   */
  const {
    isValid: isValidRole,
    reason: roleReason,
    validatedRole,
  } = await isValidAuthRole({ tag, guild, roleId });

  if (!isValidRole) {
    logger.info(tag, 'Auth role is not valid, exiting');
    return {
      canProceed: false,
      reason: roleReason,
    };
  }

  /**
   * Check for (optional) logging channel and validate it
   */
  const {
    validatedChannel,
  } = await isValidLogChannel({ tag, guild, channelId });

  logger.info(tag, 'Auth checks passed, continuing');
  return {
    canProceed: true,
    alreadyAuthed,
    saUsername,
    validatedRole,
    validatedChannel,
  };
}
