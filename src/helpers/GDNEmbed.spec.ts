import { MessageEmbed } from 'discord.js';
// Discord.js doesn't export Colors directly but we can still access it like this
// @ts-ignore
import { Colors } from 'discord.js/src/util/Constants';

import GDNEmbed from './GDNEmbed';

test('subclass Discord.js MessageEmbed', () => {
  const embed = new GDNEmbed({});

  expect(embed instanceof MessageEmbed).toEqual(true);
});

test('set embed highlight color to dark purple', () => {
  const embed = new GDNEmbed({});

  expect(embed.color).toEqual(Colors.DARK_PURPLE);
});
