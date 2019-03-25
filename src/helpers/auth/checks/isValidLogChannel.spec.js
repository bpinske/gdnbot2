jest.mock('../../logger');

const isValidLogChannel = require('./isValidLogChannel');

const validChannelId = '123';

// Pretend this is a ChannelStore that might check the API for channels by ID
const simpleChannelMatch = jest.fn().mockImplementation(
  (id) => Promise.resolve(id === validChannelId ? { name: 'foobar' } : undefined)
);

let tag;
const guild = {
  channels: {
    get: jest.fn(simpleChannelMatch)
  }
};

beforeEach(() => {
  tag = { tag: Date.now() };
});

test('return undefined when no channel ID passed in', async () => {
  const { validatedChannel } = await isValidLogChannel({ tag, guild });

  expect(validatedChannel).toBeUndefined();
});

test('return channel when passed a valid ID', async () => {
  const { validatedChannel } = await isValidLogChannel({ tag, guild, channelId: validChannelId });

  expect(validatedChannel).not.toBeUndefined();
});

test('return undefined when passed an invalid ID', async () => {
  const { validatedChannel } = await isValidLogChannel({ tag, guild, channelId: 456 });

  expect(validatedChannel).toBeUndefined();
});

test('return channel when passed a valid ID of type Number', async () => {
  const { validatedChannel } = await isValidLogChannel({ tag, guild, channelId: 123 });

  expect(validatedChannel).not.toBeUndefined();
});
