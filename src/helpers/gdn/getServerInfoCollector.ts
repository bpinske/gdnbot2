import { ArgumentCollector, CommandoClient } from 'discord.js-commando';

export default function getServerInfoCollector (client: CommandoClient): ArgumentCollector {
  return new ArgumentCollector(client, [
    {
      key: 'description',
      prompt: 'enter a short description for this server (limit 300 chars):',
      type: 'string',
      wait: 60,
      max: 130,
    },
    {
      key: 'inviteCode',
      prompt: 'enter a **non-expiring** Invite Code for this server:',
      type: 'string',
      wait: 60,
    },
  ]);
}
