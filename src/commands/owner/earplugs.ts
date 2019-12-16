
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { oneLine } from 'common-tags';

import GDNCommand from '../../helpers/GDNCommand';
import { CMD_NAMES, CMD_GROUPS, CMD_PREFIX, SETTINGS } from '../../helpers/constants';
import logger, { getLogTag } from '../../helpers/logger';
import isMention from '../../helpers/isMention';

/**
 * A command that can be used to tell the bot to stop reacting to commands.
 */
export default class EarplugsCommand extends GDNCommand {
  constructor (client: CommandoClient) {
    super(client, {
      name: CMD_NAMES.OWNER_EARPLUGS,
      group: CMD_GROUPS.OWNER,
      ownerOnly: true,
      guildOnly: true,
      memberName: 'toggle_earplugs',
      description: 'Toggle the bot\'s response to its commands',
      details: oneLine`
        Message the bot directly within a guild to enable or disable its reaction to your commands.
        This should help with running multiple versions of the bot on the same server - just put
        earplugs in the one you're not testing!
      `,
    });
  }

  async run (message: CommandoMessage) {
    const { id, guild, content } = message;
    const tag = getLogTag(id);

    logger.info(tag, `[EVENT START: ${CMD_PREFIX}${this.name}]`);

    logger.info({ ...tag, content }, 'Checking to see if the bot was mentioned directly');

    const isBotMention = isMention(content, this.client.user!.id);

    if (!isBotMention) {
      logger.info(tag, 'Bot was not mentioned directly, ignoring');
      return null;
    }

    let hasEarplugsIn = Boolean(await this.client.settings.get(SETTINGS.EARPLUGS_IN));

    logger.debug(tag, `Bot has earplugs in: ${hasEarplugsIn}`);

    const action = hasEarplugsIn ? 'Removing' : 'Inserting';
    logger.info(
      tag,
      `${action} ${this.client.user?.tag}'s earplugs in ${guild.name} (${guild.id})`,
    );

    logger.debug(tag, `Setting "${SETTINGS.EARPLUGS_IN}" to ${!hasEarplugsIn}`);

    await this.client.settings.set(SETTINGS.EARPLUGS_IN, !hasEarplugsIn);
    hasEarplugsIn = !hasEarplugsIn;

    return message.reply(`my earplugs ${hasEarplugsIn ? 'are now in' : 'have been taken out'}.`);
  }
}
