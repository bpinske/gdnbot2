const { Command } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');

// Helpers
const logger = require('../../helpers/logger');
const cleanupMessages = require('../../helpers/cleanupMessages');

// Auth helpers
const startAuthCheck = require('../../helpers/auth/startAuthCheck');
const praiseLowtaxCollector = require('../../helpers/auth/praiseLowtaxCollector');

// Auth actions
const getHash = require('../../helpers/auth/actions/getHash');
const confirmHash = require('../../helpers/auth/actions/confirmHash');

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

    // Generate a hash for the user
    const { hash, reason: hashReason } = await getHash({ tag, member, username });

    if (!hash) {
      return message.say(hashReason);
    }

    logger.info(tag, 'Messaging hash + instructions to user');

    // Send the user a PM and instructions
    const hashMessage = await member.send(stripIndents`
      You want access? You have **five minutes** to get this string into your SA profile (anywhere in the **Additional Information** section here https://forums.somethingawful.com/member.php?action=editprofile):

      **${hash}**

      Return to the server afterwards to continue the process.
    `);

    logger.info(tag, 'Awaiting response from user');

    // Wait for the user to respond after they've placed the hash in their profile
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

    logger.info(tag, 'User responded, proceeding with SA profile check');

    // Check SA profile for hash
    const { confirmed, reason: confirmReason } = await confirmHash({ tag, member, username });

    if (!confirmed) {
      cleanupMessages([hashMessage]);
      return member.send(confirmReason);
    }

    // We're done with the hash, so remove it
    cleanupMessages([hashMessage]);

    // TODO: Check if the user is blacklisted by SA ID
    // const { id } = scrapeSAProfile({ tag, username });
    // TODO: See canMemberAuth.js -> L59 for blacklist check by SA ID

    // TODO: User is confirmed and not blacklisted. Add the auth role and log it to the channel
    // await addAuthRole({ tag, role, member });
    // await logAuthMessage({ tag, channel, message });

    // TODO: Commit the user to the DB
    // await addUserToDB({ tag, member, saUsername, saID })

    return message.say(`${guild.name}: authenticating ${username}`);
  }
}

module.exports = AuthmeCommand;
