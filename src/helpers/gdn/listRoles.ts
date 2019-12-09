import { Guild, RoleStore } from 'discord.js';

/**
 * List all of the guild's Roles
 */
export default function listRoles (guild: Guild): RoleStore {
  return guild.roles;
}
