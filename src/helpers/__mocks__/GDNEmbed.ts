import { MessageEmbed } from 'discord.js';

export default class GDNEmbedMock extends MessageEmbed {
  constructor () {
    super();

    this.setTitle = jest.fn().mockImplementation(() => this);
    this.addField = jest.fn();
  }
}
