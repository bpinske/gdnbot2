const { Command } = require('discord.js-commando');
const capitalize = require('capitalize');

const GDNEmbed = require('../../classes/GDNEmbed');

const OPTIONS = {
  ROLES: 'roles',
  CHANNELS: 'channels'
};

const oneOf = [
  OPTIONS.CHANNELS,
  OPTIONS.ROLES
];

/**
 * !list
 *
 * Can be used to display a list of roles, channels, etc... (see `options` above) for whatever
 * server the command is run in
 */
class ListCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'list',
      group: 'gdn',
      memberName: 'list',
      description: 'List info about the server',
      guildOnly: true,
      args: [
        {
          key: 'option',
          prompt: `What would you like a list of?\nOptions: ${oneOf.map(opt => `\`${opt}\``)}\n`,
          type: 'string',
          oneOf
        }
      ]
    });
  }

  run (message, { option }) {
    const { guild } = message;

    const listEmbed = new GDNEmbed()
      .setTitle(`${guild.name} ${capitalize(option)}:`);

    switch (option) {
      case OPTIONS.CHANNELS:
        guild.channels.each(channel => {
          listEmbed.addField(channel.name, channel.id);
        });
        break;
      case OPTIONS.ROLES:
        guild.roles.each(role => {
          listEmbed.addField(role.name, role.id);
        });
        break;
      default:
    }

    return message.embed(listEmbed);
  }
}

module.exports = ListCommand;
