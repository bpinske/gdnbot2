import { ArgumentCollector, CommandoClient } from 'discord.js-commando';
import { stripIndents, oneLine } from 'common-tags';

import logger, { LogTag } from '../logger';
import { API_ERROR } from '../../helpers/constants';

/**
 * An interface reflecting the values returned from this collector
 */
export interface ServerInfoArgs {
  description: string;
  inviteCode: string;
}

/**
 * An ArgumentCollector for prompting users for a server description and invite code
 */
export default function getServerInfoCollector (
  tag: LogTag,
  client: CommandoClient,
): ArgumentCollector {
  return new ArgumentCollector(client, [
    {
      key: 'description',
      prompt: 'enter a short description for this server (limit 130 chars):',
      type: 'string',
      wait: 60,
      max: 130,
    },
    {
      key: 'inviteCode',
      prompt: 'enter a **non-expiring** Invite Code for this server:',
      type: 'string',
      wait: 60,
      validate: async (inviteCode: string): Promise<boolean | string> => {
        /**
         * See if the provided invite code is for an invite that'll expire
         */

        logger.info(tag, `Confirming invite code "${inviteCode}" is valid and won't expire`);

        let invite;
        try {
          invite = await client.fetchInvite(inviteCode);
        } catch (err) {
          if (err.code === API_ERROR.UNKNOWN_INVITE || err.message === '404: Not Found') {
            logger.info(tag, 'Invalid invite code, exiting');

            return oneLine`
              "${inviteCode}" doesn't seem to be a valid invite code for this guild.
              Please double-check your invites in **Server Settings > Invites** and then try
              again with a **non-expiring** invite code.
            `;
          }

          logger.error({ ...tag, err }, 'Error retrieving invite');
          throw err;
        }

        /**
         * TODO: `invite.expiresAt` via `this.client.fetchInvite()` will _always_ be null. To fix
         * this, the bot would need to be granted the MANAGE_GUILD/"Manage Server" permission, at
         * which point we could use message.guild.fetchInvites(), .get() by `inviteCode`, and view
         * that info...
         */
        // null = eternal, datetime = expires
        if (invite.expiresAt !== null) {
          logger.info(tag, 'User specified an expiring invite, exiting');

          return stripIndents`
            ${oneLine`
              The specified server invite will eventually expire, after which it will become
              impossible for users to join this server from the GDN homepage.
            `}

            ${oneLine`
              Please double-check your invites in **Server Settings > Invites** and then try
              again with a **non-expiring** invite code.
            `}
          `;
        }

        logger.info(tag, 'Invite code is valid for enrollment');
        return true;
      },
    },
  ]);
}
