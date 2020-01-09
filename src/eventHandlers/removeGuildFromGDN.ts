import { Guild } from 'discord.js';
import { AxiosError } from 'axios';

import logger, { LogTag } from '../helpers/logger';
import { axiosGDN, GDN_URLS } from '../helpers/axiosGDN';

/**
 * Remove a Discord Guild from GDN
 */
export default function removeGuildFromGDN (tag: LogTag, guild: Guild) {
  return axiosGDN.delete(`${GDN_URLS.GUILDS}/${guild.id}`)
    .then(() => {
      logger.info(tag, `Deleted guild ${guild.name} (${guild.id}) from GDN`);
    })
    .catch((err: AxiosError) => {
      // 404 means we tried to delete a server not enrolled in GDN
      if (err.response?.status !== 404) {
        logger.error({ ...tag, err }, `Error deleting guild ${guild.name} (${guild.id}) from GDN`);
      }
    });
}
