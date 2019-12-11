import { BitFieldResolvable, PermissionString } from 'discord.js';
import capitalize from 'capitalize';

/**
 * Take a permission string like "MANAGE_ROLES" and return "Manage roles"
 */
export default function prettifyPermission (perm: BitFieldResolvable<PermissionString>): string {
  let toReturn = perm.toLocaleString();
  toReturn = toReturn.replace('_', ' ');
  toReturn = capitalize(toReturn);

  return toReturn;
}
