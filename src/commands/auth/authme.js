const { Command } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');

// Helpers
const logger = require('../../helpers/logger');
const cleanupMessages = require('../../helpers/cleanupMessages');

// Auth helpers
const startAuthCheck = require('../../helpers/auth/startAuthCheck');
const praiseLowtaxCollector = require('../../helpers/auth/praiseLowtaxCollector');
const isMemberBlacklisted = require('../../helpers/auth/checks/isMemberBlacklisted');

// Auth actions
const getHash = require('../../helpers/auth/actions/getHash');
const confirmHash = require('../../helpers/auth/actions/confirmHash');
const getSAID = require('../../helpers/auth/actions/getSAID');

class AuthmeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'authme',
      group: 'auth',
      memberName: 'authme',
      description: 'Authenticate your SA account',
      guildOnly: true,
      args: [
        {
          key: 'username',
          prompt: 'What is your SA username?',
          type: 'string'
        }
      ]
    });
  }

  async run (message, { username }) {
    const { guild, member } = message;

    // Prepare a tag for logging
    const tag = logger.getLogTag(message.id);

    logger.info(tag, 'EVENT: !authme');

    /**
     * PERFORMING AUTH CHECKS
     */
    /* eslint-disable-next-line */
    const { canProceed, reason: checkReason, validatedRole, loggingChannel } = await startAuthCheck({
      tag,
      guild,
      member,
      isAuthMe: true
    });

    if (!canProceed) {
      return message.say(checkReason);
    }

    /**
     * GENERATING A VERIFICATION HASH
     */
    const { hash, reason: hashReason } = await getHash({ tag, member, username });

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

      Return to the server afterwards to continue the process.
    `);

    /**
     * WAITING FOR USER RESPONSE TO TRIGGER HASH PLACEMENT VERIFICATION
     */
    logger.info(tag, 'Awaiting response from member');

    const confirmation = await praiseLowtaxCollector(
      this.client,
      oneLine`
        I've DM'd you with a hash and further instructions. After you've completed them,
        return here and respond with **Praise Lowtax** to verify your SA membership.
      `
    ).obtain(message);

    if (confirmation.cancelled) {
      logger.warn(tag, 'User did not praise Lowtax, exiting');

      cleanupMessages([hashMessage]);

      return member.send('You have not been authenticated. Please feel free to try again.');
    }

    /**
     * VERIFYING HASH PLACEMENT
     */
    logger.info(tag, 'Member responded, continuing');

    // Check SA profile for hash
    const { confirmed, reason: confirmReason } = await confirmHash({ tag, member, username });

    if (!confirmed) {
      cleanupMessages([hashMessage]);
      return message.say(confirmReason);
    }

    // We're done with the hash, so remove it
    cleanupMessages([hashMessage]);

    /**
     * RETRIEVING SA ID FROM USER PROFILE
     */
    const { id, reason: reasonNoID } = await getSAID({ tag, username });

    if (!id) {
      return message.say(reasonNoID);
    }

    /**
     * CHECKING IF USER IS BLACKLISTED BY SA ID
     */
    const { isBlacklisted, reason: blacklistedReason } = await isMemberBlacklisted({ tag, saID: id });

    if (isBlacklisted) {
      return message.say(blacklistedReason);
    }

    /**
     * ADDING AUTH ROLE AND LOGGING MESSAGE
     */
    logger.info(tag, 'Adding auth role');
    // await addAuthRole({ tag, role, member });
    logger.info(tag, 'Sending a message to the logging channel');
    // await logAuthMessage({ tag, channel, message });

    // TODO: Commit the user to the DB
    logger.info(tag, 'Committing user info to the DB');
    // await addUserToDB({ tag, member, saUsername, saID })

    return message.say(`${guild.name}: ${username} successfully completed authme`);
  }
}

module.exports = AuthmeCommand;
