/* eslint-disable camelcase */
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { oneLine } from 'common-tags';

import GDNCommand from '../../helpers/GDNCommand';
import logger, { getLogTag } from '../../helpers/logger';
import getServerInfoCollector, { ServerInfoArgs } from '../../helpers/gdn/getServerInfoCollector';
import { inviteCodeToInviteURL, inviteURLToInviteCode } from '../../helpers/gdn/guildInvites';
import { axiosGDN, APIGuildUpdate, GDN_URLS } from '../../helpers/axiosGDN';
import truncateServerDescription from '../../helpers/gdn/truncateServerDescription';
import GDNEmbed from '../../helpers/GDNEmbed';
import { CMD_GROUPS, CMD_NAMES } from '../../helpers/constants';

import hasGuildEnrolled from '../../checks/hasGuildEnrolled';

export default class SetDescriptionCommand extends GDNCommand {
  constructor (client: CommandoClient) {
    super(client, {
      name: CMD_NAMES.GDN_UPDATE,
      group: CMD_GROUPS.GDN,
      memberName: 'update_server_info',
      description: 'Update server info in Goon Discord Network',
      details: oneLine`
        Specify a new **description** and/or **invite code** for a server visible on
        https://goondiscordnetwork.com :bee:
      `,
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
    });
  }

  async run (message: CommandoMessage) {
    const { id, guild } = message;
    const { commandPrefix: prefix } = this.client;

    const tag = getLogTag(id);

    logger.info(tag, `[START EVENT] ${prefix}${this.name}`);

    message.channel.startTyping();

    /**
     * Check that server is enrolled
     */
    const { isEnrolled, guildData } = await hasGuildEnrolled(tag, guild);

    if (!isEnrolled) {
      logger.info(tag, 'Server not enrolled, exiting');

      message.channel.stopTyping();
      return message.reply(oneLine`
        please enroll this server in GDN to enable use of this command.
      `);
    }

    if (!guildData) {
      logger.error({ ...tag, guildData }, 'Server is enrolled, but no guild data??? IMPOSSIBLE');
      throw new Error('Server is enrolled, but no server data is available');
    }

    const currentInfoEmbed = new GDNEmbed()
      .setTitle(`Current GDN Values for ${guild.name}`)
      .addField('Description', guildData.description)
      .addField('Invite Code', inviteURLToInviteCode(guildData.invite_url),
      );

    await message.embed(currentInfoEmbed);

    /**
     * Prompt the user for new server description and invite code
     */
    logger.info(tag, 'Prompting for new server description and invite code');
    const serverInfoCollector = getServerInfoCollector(tag, this.client);

    message.channel.stopTyping();

    const infoResp = await serverInfoCollector.obtain(message);
    logger.debug({ ...tag, values: infoResp.values }, 'Collected values');

    const description = (infoResp.values as ServerInfoArgs)?.description;
    const inviteCode = (infoResp.values as ServerInfoArgs)?.inviteCode;

    if (infoResp.cancelled) {
      logger.info(tag, 'User cancelled update, exiting');

      return message.reply('update cancelled, no action was taken.');
    } else if (!description && !inviteCode) {
      logger.info(tag, 'No new values provided, exiting');

      return message.reply('no new values were detected, no action was taken.');
    }

    /**
     * Submit updated data
     */
    message.channel.startTyping();

    const details: APIGuildUpdate = {
      // Sync the GDN name with the current guild name
      name: guild.name,
      description: undefined,
      invite_url: undefined,
    };

    if (description) {
      details.description = truncateServerDescription(description);
    }

    if (inviteCode) {
      details.invite_url = inviteCodeToInviteURL(inviteCode);
    }

    logger.info({ ...tag, details }, 'Submitting server to GDN API');

    try {
      await axiosGDN.patch(`${GDN_URLS.GUILDS}/${guild.id}`, details);
    } catch (err) {
      logger.error({ ...tag, err }, 'Error submitting guild data to GDN API');

      message.channel.stopTyping();
      return message.reply(`an error occurred while enrolling this server: ${err}`);
    }

    message.channel.stopTyping();
    return message.reply(oneLine`
      server info was successfully updated and is now visible at
      https://goondiscordnetwork.com :bee:
    `);
  }
}
