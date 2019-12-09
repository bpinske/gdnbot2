import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import capitalize from 'capitalize';

import GDNEmbed from '../../helpers/GDNEmbed';

import listTextChannels from '../../helpers/gdn/listTextChannels';
import listRoles from '../../helpers/gdn/listRoles';

interface ListCommandArgs {
  option: string;
}

const OPTIONS = {
  ROLES: 'roles',
  CHANNELS: 'channels',
};

const oneOf = [
  OPTIONS.CHANNELS,
  OPTIONS.ROLES,
];
const oneOfFormatted = oneOf.map(opt => `\`${opt}\``).join(', ');

/**
 * !list
 *
 * Can be used to display a list of roles, channels, etc... (see `options` above) for whatever
 * server the command is run in
 */
class ListCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'list',
      group: 'gdn',
      memberName: 'list',
      description: 'List info about the server',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
      args: [
        {
          key: 'option',
          prompt: `What would you like a list of?\nOptions: ${oneOfFormatted}\n`,
          type: 'string',
          oneOf,
        },
      ],
    });
  }

  run (message: CommandoMessage, { option }: ListCommandArgs) {
    const { guild } = message;

    const listEmbed = new GDNEmbed()
      .setTitle(`${guild.name} ${capitalize(option)}:`);

    switch (option) {
      case OPTIONS.CHANNELS:
        listTextChannels(guild).each(channel => {
          listEmbed.addField(channel.name, channel.id);
        });
        break;
      case OPTIONS.ROLES:
        listRoles(guild).each(role => {
          listEmbed.addField(role.name, role.id);
        });
        break;
      default:
    }

    return message.embed(listEmbed);
  }
}

module.exports = ListCommand;
