import { DMChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { stripIndents, oneLine } from 'common-tags';

// Helpers
import logger, { getLogTag } from '../../helpers/logger';
import cleanupMessages from '../../helpers/cleanupMessages';

// Checks
import isMemberBlacklisted from '../../checks/isMemberBlacklisted';

// Auth helpers
import startAuthCheck from '../../helpers/auth/startAuthCheck';
import praiseLowtaxCollector from '../../helpers/auth/praiseLowtaxCollector';

// Auth actions
import getHash from '../../helpers/auth/getHash';
import confirmHash from '../../helpers/auth/confirmHash';
import getSAProfile from '../../helpers/auth/getSAProfile';
import getSAID from '../../helpers/auth/getSAID';
import getSAPostCount from '../../helpers/auth/getSAPostCount';
import addRoleAndLog from '../../helpers/auth/addRoleAndLog';
import addUserToDB from '../../helpers/auth/addUserToDB';

interface AuthmeCommandArgs {
  username: string;
}

const MIN_POST_COUNT = parseInt(process.env.MIN_POST_COUNT, 10);

export default class AuthmeCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'authme',
      group: 'auth',
      memberName: 'authme',
      description: 'Authenticate your SA account',
      details: stripIndents`
        To authenticate your SA account, follow these simple instructions:

        1. Type **!authme SA-Username-Here** to begin (replace **SA-Username-Here** with your actual SA username; spaces are fine too).

        2. After you paste the code on your profile, go back to the bot and **type 'Praise Lowtax'** to finish the auth process.
      `,
      examples: [
        'authme LeetLikeJeffK',
        'authme Tempus Thales',
      ],
      guildOnly: true,
      args: [
        {
          key: 'username',
          label: 'SA Username',
          prompt: 'what is your SA username?',
          type: 'string',
        },
      ],
    });
  }

  async run (message: CommandoMessage, { username }: AuthmeCommandArgs) {
    const { guild, member } = message;

    // Prepare a tag for logging
    const tag = getLogTag(message.id);

    logger.info(tag, '[EVENT: !authme]');

    /**
     * PERFORMING AUTH CHECKS
     */
    const {
      canProceed,
      reason: checkReason,
      alreadyAuthed,
      validatedRole,
      validatedChannel,
    } = await startAuthCheck(
      tag,
      guild,
      member,
      true,
    );

    if (!canProceed) {
      return message.say(checkReason);
    }

    if (alreadyAuthed) {
      logger.info(tag, 'User has already authed, bypassing hash check');

      await addRoleAndLog(
        tag,
        member,
        username,
        validatedRole,
        validatedChannel,
      );
      return;
    }

    /**
     * GENERATING A VERIFICATION HASH
     */
    const { hash, reason: hashReason } = await getHash(tag, member, username);

    if (!hash) {
      return message.say(hashReason);
    }

    /**
     * SENDING HASH AND INSTRUCTIONS AS PM
     */
    logger.info(tag, 'Sending hash + instructions to member');

    const hashMessage = await member.send(stripIndents`
      You want access? You have **five minutes** to get this string into your SA profile (anywhere in the **Additional Information** section here https://forums.somethingawful.com/member.php?action=editprofile):

      **${hash}**

      After you've completed this, return **here** and respond with **Praise Lowtax** to verify your SA membership.
    `);

    /**
     * WAITING FOR USER RESPONSE TO TRIGGER HASH PLACEMENT VERIFICATION
     */
    logger.info(tag, 'Awaiting response from member');

    const confirmation = await praiseLowtaxCollector((hashMessage.channel as DMChannel));

    // We're done with the hash, so remove it
    cleanupMessages([hashMessage]);

    if (confirmation.cancelled) {
      logger.warn(tag, 'User did not praise Lowtax, exiting');

      return member.send(oneLine`
        You have not been authenticated. Please feel free to try again back in **${guild.name}**.
      `);
    }

    /**
     * VERIFYING HASH PLACEMENT
     */
    logger.info(tag, 'Member responded, continuing');

    // Check SA profile for hash
    const { confirmed, reason: confirmReason } = await confirmHash(tag, member, username);

    if (!confirmed) {
      return member.send(confirmReason);
    }

    /**
     * Get SA profile for analysis
     */
    const { profile, reason: reasonErrorProfileLoad } = await getSAProfile(tag, username);

    if (!profile) {
      return member.send(reasonErrorProfileLoad);
    }

    /**
     * RETRIEVING SA ID FROM USER PROFILE
     */
    const { id: saID, reason: reasonNoID } = await getSAID(tag, profile);

    if (!saID) {
      return member.send(reasonNoID);
    }

    /**
     * RETRIEVING POST COUNT FROM USER PROFILE
     */
    const { count, reason: reasonNoPostCount } = await getSAPostCount(tag, profile);

    if (count < 0) {
      return member.send(reasonNoPostCount);
    }

    // Require SA accounts to have a minimum number of posts
    if (count < MIN_POST_COUNT) {
      logger.info(tag, 'User post count is below minimum, exiting');
      return message.say(oneLine`
        Your SA account has an insufficient posting history. Please try again later.
      `);
    }

    /**
     * CHECKING IF USER IS BLACKLISTED BY SA ID
     */
    const { isBlacklisted, reason: blacklistedReason } = await isMemberBlacklisted(tag, saID);

    if (isBlacklisted) {
      // Purposefully send this to the Guild channel so that admins can notice blacklisted users
      return message.say(blacklistedReason);
    }

    /**
     * ADDING AUTH ROLE AND LOGGING MESSAGE
     */
    await addRoleAndLog(
      tag,
      member,
      username,
      validatedRole,
      validatedChannel,
    );

    /**
     * INSERTING USER INTO DATABASE
     */
    await addUserToDB(
      tag,
      member,
      saID,
      username,
    );
  }
}
