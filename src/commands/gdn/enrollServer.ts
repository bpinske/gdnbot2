import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { stripIndents } from 'common-tags';

interface EnrollCommandArgs {
  description: string;
  inviteURL: string;
}

export default class ListCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'gdn_enroll_server',
      group: 'gdn',
      memberName: 'enroll_server',
      description: 'Enroll this server in Goon Discord Network',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
      args: [
        {
          key: 'description',
          prompt: 'Enter a short description for this server (limit 300 chars):',
          type: 'string',
          default: '',
        },
        {
          key: 'inviteURL',
          prompt: 'enter an Instant Invite URL for this server:',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  run (message: CommandoMessage, { description, inviteURL }: EnrollCommandArgs) {
    return message.say(stripIndents`
      Description: ${description}

      Invite URL: ${inviteURL}
    `);
  }
}
