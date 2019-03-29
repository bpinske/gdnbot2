const { MessageEmbed } = require('discord.js');
const { Colors } = require('discord.js/src/util/Constants');

const GDNEmbed = require('./GDNEmbed');

test('subclass Discord.js MessageEmbed', () => {
  const embed = new GDNEmbed({});

  expect(embed instanceof MessageEmbed).toEqual(true);
});

test('set embed highlight color to dark purple', () => {
  const embed = new GDNEmbed({});

  expect(embed.color).toEqual(Colors.DARK_PURPLE);
});
