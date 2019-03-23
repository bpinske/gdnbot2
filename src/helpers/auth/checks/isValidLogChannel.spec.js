const isValidLogChannel = require('./isValidLogChannel');

test('return undefined channel when no channel ID passed in', async () => {
  const { validatedChannel } = await isValidLogChannel({
    tag: { tag: 'aaa' },
    guild: {
      channels: {
        get: jest.fn()
      }
    }
  });

  expect(validatedChannel).toBeUndefined();
});
