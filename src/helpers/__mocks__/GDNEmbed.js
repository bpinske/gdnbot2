const { MessageEmbed } = require('discord.js');

class GDNEmbedMock extends MessageEmbed {
  constructor () {
    super();

    this.setTitle = jest.fn().mockImplementation(title => this);
    this.addField = jest.fn();
  }
}

module.exports = GDNEmbedMock;
