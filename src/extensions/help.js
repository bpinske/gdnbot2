const { RichEmbed } = require('discord.js');

const { prefix } = require('../helpers/constants');

module.exports = {
  name: 'help',
  description: 'See everything you can do with GDN',
  execute (message, args) {
    const { client } = message;
    const { commands } = client;

    const helpEmbed = new RichEmbed()
      .setColor('DARK_PURPLE');

    if (!args.length) {
      // Prepare an embed with a list of all commands you can invoke
      helpEmbed.setTitle('Goon Discord Network (GDN) Help');
      helpEmbed.setDescription("Here's what I can do:");
      helpEmbed.addBlankField();

      // Iterate through each command and add its title and description to the embed
      commands.forEach((cmd) => {
        const title = `${prefix}${cmd.name}`;

        let description = cmd.description;
        if (description) {
          // Take the first line of multi-line descriptions as a summary of the command
          description = description.trimStart().split('\n')[0];
        } else {
          description = '';
        }

        helpEmbed.addField(title, description, false);
      });
    } else {
      // Get help for a specific command
      const helpCommand = args[0];
      const command = commands.get(helpCommand);

      if (!command) {
        message.reply(`I couldn't find any help info on "${prefix}${helpCommand}"`);
        return;
      }

      helpEmbed.setTitle(`\`${prefix}${helpCommand} ${command.usage || ''}\``);
      helpEmbed.setDescription(command.description);
    }

    message.channel.send(helpEmbed);
  }
};
