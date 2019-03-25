const { oneLine } = require('common-tags');

const {
  logger
} = require('../../');

const invalidRoleReason = oneLine`
  \`!authme\` doesn't appear to be set up properly here. Please contact a guild admin and ask them
  to "re-activate auth with an updated role ID".
`;

/**
 * Validate the server's authme role ID to make sure it references a valid role
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} guild - The guild whose roles will be searched
 * @param {string} roleId - The auth role ID provided when auth was activated
 * @returns {object} - { isValid, reason?, validatedRole }
 */
const isValidAuthRole = async ({ tag, guild, roleId }) => {
  const id = String(roleId);
  logger.info(tag, `Validating auth role ID '${id}'`);

  const validatedRole = await guild.roles.fetch(id);

  if (!validatedRole) {
    logger.info(tag, `Could not find a role with that ID in guild, exiting`);
    return {
      isValid: false,
      reason: invalidRoleReason
    };
  }

  logger.info(tag, `Found valid role: '${validatedRole.name}', continuing`);
  return {
    isValid: true,
    // Provide the actual role since we already did the work of looking it up
    validatedRole
  };
};

module.exports = isValidAuthRole;
