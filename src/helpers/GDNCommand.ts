import { Message } from 'discord.js';
import { Command, CommandoMessage } from 'discord.js-commando';
import { stripIndents, oneLine } from 'common-tags';

export default class GDNCommand extends Command {
  /**
   * Called when the command produces an error while running
   */
  onError (err: Error, message: CommandoMessage): Promise<Message|Message[]> {
    return message.reply(stripIndents`
      an error occurred while running the command: \`${err.name}: ${err.message}\`
      ${oneLine`
        The bot owner has been notified. Thank you for your patience while they get this fixed!
        :man_bowing:
      `}
    `);
  }
}
