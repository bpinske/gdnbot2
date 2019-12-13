import { CommandoClient, CommandoMessage, ArgumentCollector } from 'discord.js-commando';
import { stripIndents, oneLine } from 'common-tags';

import logger, { getLogTag } from '../../helpers/logger';

import GDNCommand from '../../helpers/GDNCommand';
import roundDown from '../../helpers/roundDown';
import { axiosGDN, GDN_URLS, APIGuild } from '../../helpers/axiosGDN';
import getServerInfoCollector, { ServerInfoArgs } from '../../helpers/gdn/getServerInfoCollector';
import truncateServerDescription from '../../helpers/gdn/truncateServerDescription';
import { inviteCodeToInviteURL } from '../../helpers/gdn/guildInvites';
import { CMD_NAMES } from '../../helpers/constants';

import hasGuildEnrolled from '../../checks/hasGuildEnrolled';
import hasMemberAuthed from '../../checks/hasMemberAuthed';
import isMemberBlacklisted from '../../checks/isMemberBlacklisted';

interface ConfirmArgs {
  confirm: boolean;
}

export default class ListCommand extends GDNCommand {
  constructor (client: CommandoClient) {
    super(client, {
      name: CMD_NAMES.GDN_ENROLL,
      aliases: ['gdn_enroll_server'],
      group: 'gdn',
      memberName: 'enroll_server',
      description: 'Enroll server in Goon Discord Network',
      details: stripIndents`
        Enroll this server in Goon Discord Network to include it on https://goondiscordnetwork.com :bee:

        ${oneLine`
          Enrolled servers can also activate \`!authme\` (see \`!gdn_enable_authme\`) to help automate SA membership detection for
          enhanced channel access control.
        `}
      `,
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
    });
  }

  async run (message: CommandoMessage) {
    const {
      id,
      name,
      memberCount,
    } = message.guild;
    const { commandPrefix: prefix } = this.client;

    const tag = getLogTag(message.id);

    logger.info(tag, `[EVENT START: ${prefix}${this.name}]`);
    logger.debug(tag, `Called in ${name} (${id})`);

    // Give some feedback that the bot is doing something
    message.channel.startTyping();

    /**
     * Ensure that the server hasn't been authed before
     */
    const { isEnrolled } = await hasGuildEnrolled(tag, message.guild);

    if (isEnrolled) {
      logger.info(tag, 'Server is already enrolled, exiting');

      message.channel.stopTyping();
      return message.reply(oneLine`
        this server has already been enrolled. Please use the update commands instead.
      `);
    }

    /**
     * Ensure the user has authed before
     */
    const { hasAuthed, memberData } = await hasMemberAuthed(tag, message.member);

    if (!hasAuthed) {
      logger.info(tag, 'User has not authed before, exiting');

      message.channel.stopTyping();
      return message.reply(stripIndents`
        You must have previously authed with \`!authme\` to use this command.

        ${oneLine`
          You can complete your initial authentication from within another server enrolled in GDN,
          or in the official GDN Discord server: ${this.client.options.invite}
        `}
      `);
    }

    /**
     * Ensure the authed user isn't blacklisted from GDN
     */
    const { isBlacklisted, reason } = await isMemberBlacklisted(tag, memberData.sa_id);

    if (isBlacklisted) {
      logger.info(tag, 'User is blacklisted from GDN, exiting');

      message.channel.stopTyping();
      return message.reply(reason);
    }

    /**
     * Prompt the user for a server description and invite code
     */
    logger.info(tag, 'Prompting for a server description and invite code');
    const serverInfoCollector = getServerInfoCollector(tag, this.client);

    message.channel.stopTyping();

    const infoResp = await serverInfoCollector.obtain(message);
    logger.debug({ ...tag, values: infoResp.values }, 'Collected values');

    const description = (infoResp.values as ServerInfoArgs)?.description;
    const inviteCode = (infoResp.values as ServerInfoArgs)?.inviteCode;

    if (infoResp.cancelled) {
      logger.info(tag, 'User cancelled enrollment, exiting');

      return message.reply('enrollment cancelled, no action was taken.');
    } else if (!description || !inviteCode) {
      logger.info(tag, 'Failed to collect description and/or invite code');

      return message.reply(oneLine`
        a server description and invite code are needed to complete enrollment. Please run
        ${this.usage()} to try again.
      `);
    }

    // Prepare server details for submission
    const details: APIGuild = {
      name,
      server_id: id,
      description: truncateServerDescription(description),
      user_count: roundDown(memberCount),
      invite_url: inviteCodeToInviteURL(inviteCode),
    };

    /**
     * Confirm details with the user
     */
    const confirmCollector = new ArgumentCollector(this.client, [
      {
        key: 'confirm',
        prompt: stripIndents`
          does everything look correct?

          **Server Name:** ${details.name}
          **Description:** ${details.description}
          **Num. Users:** ${details.user_count}
          **Invite URL:** ${details.invite_url}

          ${oneLine`
            **Please ensure that the invite URL will not expire!** If it expires, users will have
            no way to join your server from the GDN homepage.
          `}
        `,
        type: 'boolean',
      },
    ], 60);

    // Wait for the user to confirm details
    message.channel.stopTyping();
    const confirmResp = await confirmCollector.obtain(message);
    const confirm = (confirmResp.values as ConfirmArgs)?.confirm;

    if (!confirm) {
      logger.info(tag, 'User did not confirm that values correct, exiting');
      return message.reply('the server was not enrolled. Feel free to try again, though!');
    }

    /**
     * Submit details to API
     */
    message.channel.startTyping();

    logger.info({ ...tag, details }, 'Submitting server to GDN API');

    try {
      await axiosGDN.post(GDN_URLS.GUILDS, details);
      logger.info(tag, 'Server was successfully added to database');
    } catch (err) {
      logger.error({ ...tag, err }, 'Error submitting guild data to GDN API');

      message.channel.stopTyping();
      return message.reply(`an error occurred while enrolling this server: ${err}`);
    }

    message.channel.stopTyping();
    return message.reply(oneLine`
      welcome aboard! This server has been enrolled in GDN and is now discoverable at
      https://goondiscordnetwork.com :bee:
    `);
  }
}
