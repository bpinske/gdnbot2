const { oneLine, stripIndents } = require('common-tags');

const logger = require('../../logger');

const error50013 = (member, role) => {
  const _role = `**${role.name}**`;
  const _username = `**${member.user.tag}**`;

  return stripIndents`
    @here GDNBot just now attempted to apply the ${_role} role to ${_username}, but none of the bot's own roles are higher than the ${_role} role. Alternatively, if this member is an admin then they may be assigned a role that is positioned higher in the Roles hierarchy than the **GDN** role.

    To fix this for future members, please apply a higher role to GDNBot, or go into **Server Settings > Roles** and click-and-drag the **GDN** role to _above_ the ${_role} role.

    Afterwards you will need to manually apply the ${_role} role to ${_username}.
  `;
};

/**
 * Add the role to the user, and optionally log a successful auth message
 *
 * @param {object} tag - The output from a call to logger.getLogTag()
 * @param {Member} member - The role to give the member
 * @param {string} saUsername - The member's SA username
 * @param {Role} role - The role to give the member
 * @param {GuildChannel} channel - An optional channel to log the auth message to
 */
const addRoleAndLog = async ({ tag, member, saUsername, role, channel }) => {
  logger.info(tag, 'Adding role to member');

  try {
    await member.edit({ roles: [role], reason: 'GDN: Successful Auth' });
  } catch (err) {
    logger.error(
      { ...tag, err },
      oneLine`
        Error in guild ${role.guild.name} adding role ${role.name} to member ${member.user.tag}
        (${member.id})
      `);
    if (err.code === 50013) {
      if (channel) {
        await channel.send(error50013(member, role));
      } else {
        logger.error(tag, oneLine`
          Unable to send diagnostic message to Guild because no auth logging channel was
          configured. Manual intervention will be required.
        `);
      }
    }
  }

  if (channel) {
    logger.info(tag, 'logging successful auth message to logging channel');
    await channel.send(`${member.user.tag} (SA: ${saUsername}) successfully authed`);
  }

  logger.info(tag, 'Informing user of successful auth');
  await member.send('You did it :getin:');
};

module.exports = addRoleAndLog;
