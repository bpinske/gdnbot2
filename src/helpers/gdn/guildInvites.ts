const inviteURLPrefix = 'https://discord.gg/';

/**
 * Convert `D3KyEJ` into `https://discord.gg/D3KyEJ`
 */
export function inviteCodeToInviteURL (inviteCode: string): string {
  return `${inviteURLPrefix}${inviteCode}`;
}

/**
 * Convert `https://discord.gg/D3KyEJ` into `D3KyEJ`
 */
export function inviteURLToInviteCode (inviteURL: string): string {
  return inviteURL.replace(inviteURLPrefix, '');
}
