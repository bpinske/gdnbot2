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
const addRoleAndLog = require('../../helpers/auth/actions/addRoleAndLog');
const addUserToDB = require('../../helpers/auth/actions/addUserToDB');

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

    logger.info(tag, '[EVENT: !authme]');

    /**
     * PERFORMING AUTH CHECKS
     */
    const {
      canProceed,
      reason: checkReason,
      alreadyAuthed,
      validatedRole,
      validatedChannel
    } = await startAuthCheck({
      tag,
      guild,
      member,
      isAuthMe: true
    });

    if (!canProceed) {
      return message.say(checkReason);
    }

    if (alreadyAuthed) {
      logger.info(tag, 'User has already authed, bypassing hash check');

      await addRoleAndLog({
        tag,
        member,
        saUsername: username,
        role: validatedRole,
        channel: validatedChannel
      });
      return;
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

      After you've completed this, return **here** and respond with **Praise Lowtax** to verify your SA membership.
    `);

    /**
     * WAITING FOR USER RESPONSE TO TRIGGER HASH PLACEMENT VERIFICATION
     */
    logger.info(tag, 'Awaiting response from member');

    const confirmation = await praiseLowtaxCollector({ channel: hashMessage.channel });

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
    const { confirmed, reason: confirmReason } = await confirmHash({ tag, member, username });

    if (!confirmed) {
      return member.send(confirmReason);
    }

    /**
     * RETRIEVING SA ID FROM USER PROFILE
     */
    const { id, reason: reasonNoID } = await getSAID({ tag, username });

    if (!id) {
      return member.send(reasonNoID);
    }

    /**
     * CHECKING IF USER IS BLACKLISTED BY SA ID
     */
    const { isBlacklisted, reason: blacklistedReason } = await isMemberBlacklisted({ tag, saID: id });

    if (isBlacklisted) {
      // Purposefully send this to the Guild channel so that admins can notice blacklisted users
      return message.say(blacklistedReason);
    }

    /**
     * ADDING AUTH ROLE AND LOGGING MESSAGE
     */
    await addRoleAndLog({
      tag,
      member,
      saUsername: username,
      role: validatedRole,
      channel: validatedChannel
    });

    /**
     * INSERTING USER INTO DATABASE
     */
    await addUserToDB({
      tag,
      member,
      saID: id,
      saUsername: username
    });
  }
}

module.exports = AuthmeCommand;
