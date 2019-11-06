const { Collection } = require('discord.js');

// Mock GDNEmbed so we can check its methods
jest.mock('../src/helpers/GDNEmbed');

// jest.unmock('../src/helpers/logger');
// const logger = require('../src/helpers/logger');
const GDNEmbed = require('../src/helpers/GDNEmbed');

const ListCommand = require('../src/commands/gdn/list');

const list = new ListCommand({});

const ROLE_1 = {
  id: 123,
  name: 'Role 1'
};
const ROLE_2 = {
  id: 456,
  name: 'Role 2'
};
const roles = new Collection([
  [ROLE_1, ROLE_1],
  [ROLE_2, ROLE_2]
]);

const TEXT_CHANNEL_1 = {
  id: 123,
  name: 'Text Channel 1',
  type: 'text'
};
const VOICE_CHANNEL = {
  id: 456,
  name: 'Voice Channel',
  type: 'voice'
};
const TEXT_CHANNEL_2 = {
  id: 789,
  name: 'Text Channel 2',
  type: 'text'
};
const channels = new Collection([
  [TEXT_CHANNEL_1, TEXT_CHANNEL_1],
  [VOICE_CHANNEL, VOICE_CHANNEL],
  [TEXT_CHANNEL_2, TEXT_CHANNEL_2]
]);

const guild = {
  name: 'testGuild',
  roles,
  channels
};

const message = {
  guild,
  embed: jest.fn()
};

test('return a GDNEmbed', () => {
  list.run(message, { option: 'roles' });

  expect(message.embed.mock.calls[0][0]).toBeInstanceOf(GDNEmbed);
});

test('add all guild roles to embed', () => {
  list.run(message, { option: 'roles' });

  const embed = message.embed.mock.calls[0][0];

  expect(embed.addField).toHaveBeenCalledTimes(2);
});

test('add only text channels to embed', () => {
  list.run(message, { option: 'channels' });

  const embed = message.embed.mock.calls[0][0];

  expect(embed.addField).toHaveBeenCalledTimes(2);
});
