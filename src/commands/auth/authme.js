const { Command } = require('discord.js-commando');

const praiseLowtaxCollector = require('../../classes/praiseLowtaxCollector');
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
    const { guild } = message;

    // try {
    //   const resp = await axiosGDN.get(`${URLS.MEMBERS}/${member.id}`);
    //   console.log('status:', resp.status);
    // } catch (err) {
    //   console.error(err.message);
    // }

    // Wait for the user to respond after they've placed the hash in their profile
    const confirmation = await praiseLowtaxCollector.obtain(message);
    console.log(confirmation);

    return message.say(`${guild.name}: authenticating ${username}`);
  }
}

module.exports = AuthmeCommand;
