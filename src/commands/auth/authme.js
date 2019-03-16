const { Command } = require('discord.js-commando');

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

  run (message, { username }) {
    const { guild } = message;

    return message.say(`${guild.name}: authenticating ${username}`);
  }
}

module.exports = AuthmeCommand;
