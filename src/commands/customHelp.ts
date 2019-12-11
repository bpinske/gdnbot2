import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { stripIndents, oneLine } from 'common-tags';
const { disambiguation } = require('discord.js-commando/src/util');

/* eslint-disable-next-line import/first */
import GDNEmbed from '../helpers/GDNEmbed';

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
          permsFormatted = userPermissions.join('\n');
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
      return message.say({
        embed: {
          title: 'Help Menu',
          description: stripIndents`
          ${oneLine`
            To run a command in ${message.guild ? message.guild.name : 'any server'},
            use \`${Command.usage('command', message.guild ? message.guild.commandPrefix : null)}\`
            For example, \`${Command.usage('ping', message.guild ? message.guild.commandPrefix : null)}\`
          `}

          Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
          Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.

          __**${showAll ? 'All commands' : `Available commands in ${message.guild || 'this DM'}`}**__

          ${(showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(message.message))))
              .map(grp => stripIndents`
              **${grp.name}**
              ${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(message.message)))
                  .map(cmd => `\`${cmd.name}\` — ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
                }
            `).join('\n\n')
            }
        `,
        },
      });
    }
  }
}
