import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class SetDescriptionCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'gdn_update_server',
      aliases: ['gdn_update'],
      group: 'gdn',
      memberName: 'update_server_info',
      description: 'Update the server\'s description and/or invite code',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
    });
  }

  run (message: CommandoMessage) {
    return message.say('update');
  }
}
