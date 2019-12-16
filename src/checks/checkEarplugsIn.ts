import { GuildSettingsHelper } from 'discord.js-commando';

import { SETTINGS } from '../helpers/constants';

export default async function checkEarplugsIn (settings: GuildSettingsHelper): Promise<boolean> {
  const earplugsIn = await settings.get(SETTINGS.EARPLUGS_IN);
  return Boolean(earplugsIn);
}
