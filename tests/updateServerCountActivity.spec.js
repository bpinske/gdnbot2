const updateServerCountActivity = require('../src/eventHandlers/updateServerCountActivity');

// jest.unmock('../src/helpers/logger');
const logger = require('../src/helpers/logger');

const bot = {
  guilds: {
    size: 4
  },
  user: {
    setActivity: jest.fn()
  }
};

test('set bot activity to reflect current number of joined guilds', async () => {
  await updateServerCountActivity({ bot });

  expect(bot.user.setActivity).toHaveBeenCalledWith(`in ${bot.guilds.size} servers`);
});

test('logs updated activity string', async () => {
  await updateServerCountActivity({ bot });

  expect(logger.info).toHaveBeenCalledWith(`setting activity to "in ${bot.guilds.size} servers"`);
});
