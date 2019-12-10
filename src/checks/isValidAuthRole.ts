import { oneLine } from 'common-tags';
import { Guild, Role } from 'discord.js';

import logger, { LogTag } from '../helpers/logger';

const invalidRoleReason = oneLine`
  \`!authme\` doesn't appear to be set up properly here. Please contact a guild admin and ask them
  to "re-activate auth with an updated role ID".
`;

interface ValidatedAuthRole {
  isValid: boolean;
  reason?: string;
  guildRole?: Role;
}

/**
 * Validate the server's authme role ID to make sure it references a valid role
 */
export default async function isValidAuthRole (tag: LogTag, guild: Guild, roleId: string): Promise<ValidatedAuthRole> {
  logger.info(tag, `Validating auth role ID '${roleId}'`);

  if (!roleId) {
    logger.info(tag, 'No role ID specified, exiting');
    return {
      isValid: false,
      reason: invalidRoleReason,
    };
  }

  const validatedRole = await guild.roles.fetch(roleId);

  if (!validatedRole) {
    logger.info(tag, 'Could not find a role with that ID in guild, exiting');
    return {
      isValid: false,
      reason: invalidRoleReason,
    };
  }

  logger.info(tag, `Found valid role: '${validatedRole.name}', continuing`);
  return {
    isValid: true,
    // Provide the actual role since we already did the work of looking it up
    guildRole: validatedRole,
  };
}
