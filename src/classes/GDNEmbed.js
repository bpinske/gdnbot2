const { MessageEmbed } = require('discord.js');

/**
 * A subclass of MessageEmbed that specifies a purple color on init
 */
class GDNEmbed extends MessageEmbed {
  constructor (data) {
    super(data);

    this.setColor('DARK_PURPLE');
  }
}

module.exports = GDNEmbed;
