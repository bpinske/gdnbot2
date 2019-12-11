/* eslint-disable import/first */
import { Command, CommandoClient, CommandoMessage, CommandGroup } from 'discord.js-commando';
import { stripIndents, oneLine } from 'common-tags';
const { disambiguation } = require('discord.js-commando/src/util');

import GDNEmbed from '../helpers/GDNEmbed';
import prettifyPermission from '../helpers/prettifyPermission';

interface HelpCommandArgs {
  command: string;
}

export default class HelpCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'help',
      group: 'util',
      memberName: 'help',
      aliases: ['commands'],
      description: 'Displays a list of available commands, or detailed information for a specified command.',
      details: oneLine`
        The command may be part of a command name or a whole command name.
        If it isn't specified, all available commands will be listed.
      `,
      examples: ['help', 'help prefix'],
      guarded: true,
      guildOnly: true,
      args: [
        {
          key: 'command',
          prompt: 'Which command would you like to view the help for?',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  async run (message: CommandoMessage, { command }: HelpCommandArgs) {
    const groups = this.client.registry.groups;
    // Try to match the entered command name to an actual command
    const commands = this.client.registry.findCommands(command, false, message);
    const prefix = message.guild.commandPrefix;

    const showAll = command?.toLowerCase() === 'all';

    if (command && !showAll) {
      // Display help for a specific command
      if (commands.length === 1) {
        const {
          name,
          description,
          group,
          guildOnly,
          ownerOnly,
          nsfw,
          userPermissions,
          aliases,
          details,
          examples,
        } = commands[0];

        const title = `Help Menu for \`${prefix}${name}\``;

        const descMeta = [];
        if (guildOnly) {
          descMeta.push('Guild Only');
        }
        if (nsfw) {
          descMeta.push('NSFW');
        }

        const descriptionFormatted = stripIndents`
          *${description}${descMeta.length > 0 ? ` (${descMeta.join(', ')})` : ''}*
        `;

        let aliasesFormatted = 'N/A';
        if (aliases?.length > 0) {
          aliasesFormatted = aliases.join(', ');
        }

        let detailsFormatted = details;
        if (!detailsFormatted) {
          detailsFormatted = 'None Available';
        }

        let examplesFormatted = 'None Available';
        if (examples?.length > 0) {
          examplesFormatted = examples.map((ex: string) => `**${prefix}${ex}**`).join('\n');
        }

        let permsFormatted = 'All Users';
        if (ownerOnly) {
          permsFormatted = 'Bot Owner';
        } else if (userPermissions?.length > 0) {
          permsFormatted = userPermissions.map(prettifyPermission).join('\n');
        }

        const embed = new GDNEmbed()
          .setTitle(title)
          .setDescription(descriptionFormatted)
          .addField('Aliases', aliasesFormatted, true)
          .addField('Group', group.name, true)
          .addField('Permissions', permsFormatted, true)
          .addField('Details', detailsFormatted, false)
          .addField('Example(s)', examplesFormatted, false)
          .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL())
          .setTimestamp();

        try {
          return message.embed(embed);
        } catch (err) {
          return message.say('There was an unknown error.');
        }
      }

      if (commands.length > 15) {
        return message.say('Multiple commands found. Please be more specific.');
      }

      if (commands.length > 1) {
        return message.say(disambiguation(commands, 'commands'));
      }

      return message.say(
        `Unable to identify command. Use ${message.usage()} to view the list of all commands.`,
      );
    } else {
      // Return an overview of all available commands
      const embed = new GDNEmbed()
        .setTitle('GDN Bot Help')
        .setDescription(stripIndents`
          *Your server's interface to the Goon Discord Network (GDN) :bee:*
          *Official GDN Discord Server: ${this.client.options.invite}*

          Use ${this.usage('<command>', prefix, null)} to view detailed information about a specific command.

          __**${showAll ? 'All commands' : `Available commands in ${message.guild || 'this DM'}`}**__
        `);

      let groupsToShow = groups;
      if (!showAll) {
        groupsToShow = groupsToShow.filter(
          (grp: CommandGroup) => grp.commands.some(cmd => {
            const usable = cmd.isUsable(message);
            return usable;
          }),
        );
      }

      groupsToShow.forEach((group) => {
        let groupCommands = group.commands;
        if (!showAll) {
          groupCommands = groupCommands
            .filter(cmd => {
              const usable = cmd.isUsable(message);
              return usable;
            });
        }

        const commandsFormatted = groupCommands
          .map((cmd) => `**${cmd.name}** - ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`)
          .join('\n');

        embed.addField(`${group.name}`, commandsFormatted);
      });

      embed.setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL());
      embed.setTimestamp();

      return message.embed(embed);
    }
  }
}
