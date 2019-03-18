const { Command } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');

// Helpers
const {
  axiosGDN,
  logger,
  cleanupMessages
} = require('../../helpers');
// Auth helpers
const {
  praiseLowtaxCollector,
  startAuthCheck
} = require('../../helpers/auth');

const URLS = {
  MEMBERS: '/gdn/members',
  SERVERS: '/gdn/servers'
};

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
    const tag = logger.getLogTag(message.id);

    // const { canProceed, validatedRole, loggingChannel } = await startAuthCheck({
    const { canProceed, reason } = await startAuthCheck({
      tag,
      guild,
      member,
      isAuthMe: true
    });

    if (!canProceed) {
      return message.say(oneLine`
        I could not proceed with authentication for the following reason: ${reason}
      `);
    }

    const hash = 'aaa';

    // Send the user a PM and instructions
    const hashMessage = await member.send(stripIndents`
      You want access? You have **five minutes** to get this string into your SA profile (anywhere in the **Additional Information** section here https://forums.somethingawful.com/member.php?action=editprofile):

      **${hash}**

      Return to the server afterwards to continue the process.
    `);

    // Wait for the user to respond after they've placed the hash in their profile
    const confirmation = await praiseLowtaxCollector(
      this.client,
      oneLine`
        I've DM'd you with a hash and further instructions. After you've completed them,
        return here and respond with **Praise Lowtax** to verify your SA membership.
      `
    ).obtain(message);

    if (confirmation.cancelled) {
      cleanupMessages([hashMessage]);
      return message.say(`
        You have not yet been authenticated. Please feel free to try again.
      `);
    }

    // An example of talking to the GDN API
    try {
      const resp = await axiosGDN.get(`${URLS.MEMBERS}/${member.id}`);
      logger.info(tag, 'status:', resp.status);
    } catch (err) {
      const { response } = err;
      if (response && response.status === 404) {
        logger.info(tag, 'user has not authed before');
        // Clean up the auth message
        cleanupMessages([hashMessage]);
      } else {
        logger.error(tag, err);
      }
    }

    // if (confirmation.cancelled) {
    //   logger.warn(tag, 'User did not praise Lowtax, returning');
    //   return member.send('Lowtax is displeased. Go back and try again');
    // }
    // logger.info(tag, 'user confirmed, proceeding with SA profile check');

    return message.say(`${guild.name}: authenticating ${username}`);
  }
}

module.exports = AuthmeCommand;
