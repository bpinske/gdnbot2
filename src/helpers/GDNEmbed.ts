import { MessageEmbed, MessageEmbedOptions } from 'discord.js';

/**
 * A subclass of MessageEmbed that specifies a purple color on init
 */
export default class GDNEmbed extends MessageEmbed {
  constructor (data?: MessageEmbed | MessageEmbedOptions) {
    super(data);

    this.setColor('DARK_PURPLE');
  }
}
