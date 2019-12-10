import { CommandoClient } from 'discord.js-commando';

import updateServerCountActivity from '../src/eventHandlers/updateServerCountActivity';

// jest.unmock('../src/helpers/logger');
import logger from '../src/helpers/logger';

const bot = {
  guilds: {
    size: 4,
  },
  user: {
    setActivity: jest.fn(),
  },
} as unknown as CommandoClient;

test('set bot activity to reflect current number of joined guilds', async () => {
  await updateServerCountActivity(bot);

  expect(bot.user.setActivity).toHaveBeenCalledWith(`in ${bot.guilds.size} servers`);
});

test('logs updated activity string', async () => {
  await updateServerCountActivity(bot);

  expect(logger.info).toHaveBeenCalledWith(`setting activity to "in ${bot.guilds.size} servers"`);
});
