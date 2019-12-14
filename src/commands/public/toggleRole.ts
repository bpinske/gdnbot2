/* eslint-disable camelcase */
import { Role } from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { oneLine } from 'common-tags';

import GDNCommand from '../../helpers/GDNCommand';
import { CMD_NAMES, API_ERROR } from '../../helpers/constants';
import logger, { getLogTag } from '../../helpers/logger';

import hasGuildEnrolled from '../../checks/hasGuildEnrolled';

interface RoleArgs {
  role: Role;
}

export default class SetDescriptionCommand extends GDNCommand {
  constructor (client: CommandoClient) {
    super(client, {
      name: CMD_NAMES.PUBLIC_TOGGLE_ROLE,
      group: 'public',
      memberName: 'toggle_role',
      description: 'Toggle a server role on yourself',
      details: '',
      guildOnly: true,
      args: [
        {
          key: 'role',
          type: 'string',
          prompt: 'which role are you interested in?',
          validate: (roleName: string, message: CommandoMessage): boolean | string => {
            const { id } = message;
            const tag = getLogTag(id);

            logger.info(tag, `Validating role name "${roleName}"`);

            const toFind = `${roleName.toLowerCase()}`;
            const role = message.guild.roles.find((role) => role.name.toLowerCase() === toFind);

            if (!role) {
              return oneLine`
                that doesn't appear to be a valid role. Try again.
              `;
            }

            logger.info(tag, `Found matching role "${role.name}" (${role.id})`);

            return true;
          },
          parse: (roleName: string, message: CommandoMessage): Role => {
            const { id } = message;
            const tag = getLogTag(id);

            logger.info(tag, `Parsing ${roleName}`);

            const toFind = `${roleName.toLowerCase()}`;
            return message.guild.roles.find((role) => role.name.toLowerCase() === toFind)!;
          },
        },
      ],
    });
  }

  async run (message: CommandoMessage, { role }: RoleArgs) {
    const { id, guild, member } = message;
    const tag = getLogTag(id);
    const { commandPrefix: prefix } = this.client;

    logger.info(tag, `[EVENT START: ${prefix}${this.name}]`);

    logger.info(
      tag,
      `Toggling role "${role.name}" in ${guild.name} (${guild.id}) on ${member.user.tag}`,
    );

    /**
     * See if the server is enrolled
     */
    const { isEnrolled, guildData } = await hasGuildEnrolled(tag, guild);

    /**
     * Check if the role the user specified is the enrolled guild's "verified goon" role
     */
    if (isEnrolled && guildData?.validated_role_id) {
      const gdnRole = guild.roles.get(guildData.validated_role_id);

      if (gdnRole && gdnRole.id === role.id) {
        return message.reply(oneLine`
          that role cannot be toggled, please try again.
        `);
      }
    }

    const hasRole = member.roles.has(role.id);

    try {
      let reply;
      if (hasRole) {
        logger.info(tag, 'Removing role');
        await member.roles.remove(role, 'GDN: Toggled role off');
        reply = `you no longer have the ${role.name} role`;
      } else {
        logger.info(tag, 'Adding role');
        await member.roles.add(role, 'GDN: Toggled role on');
        reply = `you now have the ${role.name} role`;
      }

      return message.reply(reply);
    } catch (err) {
      if (err.code === API_ERROR.MISSING_PERMISSIONS) {
        logger.info(tag, 'User tried to toggle a role above them');
        return message.reply('that role cannot be toggled, please try again.');
      } else {
        logger.info({ ...tag, err }, 'Error toggling role');
        throw err;
      }
    }
  }
}
