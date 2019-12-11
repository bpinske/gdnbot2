import { Command, CommandoClient, CommandoMessage, ArgumentCollector } from 'discord.js-commando';
import { stripIndents, oneLine } from 'common-tags';

import logger, { getLogTag } from '../../helpers/logger';
import { API_ERROR } from '../../helpers/constants';
import roundDown from '../../helpers/roundDown';

import hasGuildEnrolled from '../../checks/hasGuildEnrolled';
import hasMemberAuthed from '../../checks/hasMemberAuthed';
import isMemberBlacklisted from '../../checks/isMemberBlacklisted';

interface EnrollCommandArgs {
  description: string;
  inviteCode: string;
}

interface ConfirmArg {
  confirm: boolean;
}

export default class ListCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'gdn_enroll_server',
      aliases: ['gdn_enroll'],
      group: 'gdn',
      memberName: 'enroll_server',
      description: 'Enroll this server in Goon Discord Network',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
      args: [
        {
          key: 'description',
          prompt: 'enter a short description for this server (limit 300 chars):',
          type: 'string',
          wait: 60,
        },
        {
          key: 'inviteCode',
          prompt: 'enter a **non-expiring** Invite Code for this server:',
          type: 'string',
          wait: 60,
        },
      ],
    });
  }

  async run (message: CommandoMessage, { description, inviteCode }: EnrollCommandArgs) {
    const {
      id,
      name,
      memberCount,
      iconURL,
    } = message.guild;

    const tag = getLogTag(message.id);

    logger.info(tag, `[EVENT START: !${this.name}]`);
    logger.debug(tag, `Called in ${name} (${id})`);

    // Give some feedback that the bot is doing something
    message.channel.startTyping();

    // Ensure that the server hasn't been authed before
    const { isEnrolled } = await hasGuildEnrolled(tag, message.guild);

    if (isEnrolled) {
      logger.info(tag, 'Server is already enrolled, exiting');

      message.channel.stopTyping();
      return message.reply(oneLine`
        this server has already been enrolled. Please use the update commands instead.
      `);
    }

    // Ensure the user has authed before
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

    // Ensure the authed user isn't blacklisted from GDN
    const { isBlacklisted, reason } = await isMemberBlacklisted(tag, memberData.sa_id);

    if (isBlacklisted) {
      logger.info(tag, 'User is blacklisted from GDN, exiting');

      message.channel.stopTyping();
      return message.reply(reason);
    }

    logger.info(tag, `Confirming invite code "${inviteCode}" is valid and won't expire`);

    // See if the provided invite code is for an invite that'll expire
    let invite;
    try {
      invite = await this.client.fetchInvite(inviteCode);
    } catch (err) {
      if (err.code === API_ERROR.UNKNOWN_INVITE) {
        logger.info(tag, 'Invalid invite code, exiting');

        return message.reply(stripIndents`
          "${inviteCode}" doesn't seem to be a valid invite code for this guild.

          ${oneLine`
            Please double-check your invites in **Server Settings > Invites** and then try
            ${this.usage()} again with a **non-expiring** invite code.
          `}
        `);
      }

      logger.error({ ...tag, err }, 'Error retrieving invite');
      throw err;
    }

    /**
     * TODO: `invite.expiresAt` via `this.client.fetchInvite()` will _always_ be null. To fix this,
     * the bot would need to be granted the MANAGE_GUILD/"Manage Server" permission, at which point
     * we could use message.guild.fetchInvites(), .get() by `inviteCode`, and view that info...
     */
    // null = eternal, datetime = expires
    if (invite.expiresAt !== null) {
      logger.info(tag, 'User specified an expiring invite, exiting');

      return message.reply(stripIndents`
        The specified server invite will eventually expire, after which it will become impossible
        for users to join this server from the GDN homepage.

        ${oneLine`
          Please double-check your invites in **Server Settings > Invites** and then try
          ${this.usage()} again with a **non-expiring** invite code.
        `}
      `);
    }

    logger.info(tag, 'Invite code is valid for enrollment');

    // Prepare server details for submission
    const details = {
      name,
      server_id: id,
      description: description.substr(0, 300),
      icon_url: iconURL,
      user_count: roundDown(memberCount),
      invite_url: `https://discord.gg/${inviteCode}`,
    };

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
    const resp = await confirmCollector.obtain(message);

    const values = (resp.values as ConfirmArg);

    if (!values?.confirm) {
      logger.info(tag, 'User did not confirm that values correct, exiting');
      return message.reply('the server was not enrolled. Feel free to try again, though!');
    }

    message.channel.startTyping();

    logger.info({ ...tag, details }, 'Submitting server to GDN API');
    // TODO
    // helpers/axiosGDN.post(GDN_URLS.GUILDS, details);

    message.channel.stopTyping();

    logger.info(tag, '[EVENT STOP]');

    return message.reply(oneLine`
      welcome aboard! This server has been enrolled in GDN and is now discoverable at
      https://goondiscordnetwork.com :bee:
    `);
  }
}
