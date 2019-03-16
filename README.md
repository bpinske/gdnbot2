# GDNBot2: The Son of GDNBot

An experiment in using JavaScript for a Discord bot. This time, we'll use [Discord.js](https://discord.js.org/#/docs/main/stable/general/welcome).

This application runs using the ["GDNDev" bot](https://discordapp.com/developers/applications/347212481367638027/bots) specified in the Discord Developer Portal.

## Requirements

- Node v10.15.3

## Development

Install dependencies:

```sh
$> npm install
```

Run the bot in development mode:

```sh
$> npm start
```

## Deployment

## Additional Notes

### Current GDNBot commands:

```
Your server's interface to the Goon Discord Network (GDN).
Official GDN Discord Server: https://discord.gg/vH8uVUE

Auth:
  authme              Authenticate your SA account
GDNServices:
  gdn_activate_auth   Initialize `!authme` on this server
  gdn_enroll_server   Enroll this server in Goon Discord Network
  gdn_set_description Set the server's Directory description
  gdn_set_invite_url  Set the server's Instant Invite URL
  gdn_set_name        Set the server's name
  gdn_update_counts   Update member counts for all GDN servers
✅list_channels       List all text channels and IDs for this server
✅list_roles          List all roles and IDs for this server
  list_server_info    DEBUG: List cached info on this server
ModCommands:
  gdn_mute            Mute a user to block their messages
  gdn_unmute          Unmute a user so they can message again
​No Category:
  help                Shows this message.
  list_extensions
  reload

Type !help command for more info on a command.
You can also type !help category for more info on a category.
```

