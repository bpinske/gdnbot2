import { GuildSettingsHelper } from 'discord.js-commando';

import { SETTINGS } from '../helpers/constants';

export default async function areEarplugsIn (settings: GuildSettingsHelper): Promise<boolean> {
  const earplugsIn = await settings.get(SETTINGS.EARPLUGS_IN, false);
  return Boolean(earplugsIn);
}
