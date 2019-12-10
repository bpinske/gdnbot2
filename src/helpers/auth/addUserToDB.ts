import logger, { LogTag } from '../logger';
import { axiosGDN, GDN_URLS, APIMember } from '../axiosGDN';
import { GuildMember } from 'discord.js';

/**
 * Insert the authed user into the GDN database
 */
export default async function addUserToDB (
  tag: LogTag,
  member: GuildMember,
  saID: string,
  saUsername: string,
): Promise<void> {
  try {
    const payload = {
      discord_id: member.id,
      sa_id: saID,
      sa_username: saUsername.substr(0, 19),
    };

    logger.info(tag, `Inserting member into database: ${JSON.stringify(payload)}`);

    await axiosGDN.post<APIMember>(GDN_URLS.MEMBERS, payload);
    logger.info(tag, 'Successfully inserted member');
  } catch (err) {
    logger.error({ ...tag, err }, 'Error inserting user');
  }
}
