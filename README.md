# GDNBot2: The Son of GDNBot

An experiment in using JavaScript for a Discord bot. This time, we'll use [Discord.js](https://discord.js.org/#/docs/main/stable/general/welcome).

This application runs using the ["GDNDev" bot](https://discordapp.com/developers/applications/347212481367638027/bots) specified in the Discord Developer Portal.

## Requirements

- Docker + Compose
- Node v12.13.1 (Optional)
  - Install this if you want to install dependencies for editor autocomplete during development

## Development

If you want to install the bot's dependencies locally to allow your editor to perform things like code completion, run the following:

```sh
$> npm install
```

To run the bot in development mode, launch it with Compose:

```sh
$> docker-compose up
```

The bot will start up in a container with the source code bound to the container. This will allow `nodemon` to correctly restart the bot within the container after you edit a file in your editor.

## Deployment

### Start

To start the bot in production mode, run the following command:

```sh
$> ./start-prod.sh
```

The bot will launch without any kind of automatic restart upon file change.

### Update

To deploy a new version of the bot, run the following command:

```sh
$> ./update-bot-container.sh
```

This will pull the latest code, stop and clean up old containers, then rebuild and launch the bot in production mode.

## Testing

Unit tests can be run once using the following command:

```sh
$> npm run test
```

While writing tests, a "watch" mode can be activated that will automatically re-run tests whenever a file is changed:

```sh
$> npm run test:watch
```

To see a coverage report, run the following:

```sh
$> npm run test:coverage
```

## Additional Notes

### Discord API status codes:

Error codes that may appear when executing certain actions can be cross-referenced here: https://discordapp.com/developers/docs/topics/opcodes-and-status-codes

Common ones experienced so far:

- **50013** (Missing Permissions): The bot's highest role is _lower_ than the highest role assigned to the Member.
    - This definitely causes issues when trying to add a role to an admin user, as the admin user's role will almost certainly be higher up the Roles hierarchy than any of the bot's roles. I think it'll be fine, though, because auth attempts will most likely occur before any kind of role escalation...

### Current GDNBot commands:

Current status of commands ported over from GDNBot v1:

**Auth:**
- ✅authme

**GDNServices:**
- ✅gdn_enroll_server
- ✅gdn_set_description (see new `!gdn_update`)
- ✅gdn_set_invite_url (see `!gdn_update`)
- ✅gdn_set_name (sync as part of `!gdn_update`)
- 🛠gdn_activate_auth (see `!gdn_enable_authme`)
- ✅gdn_update_counts (now automated, every 24 hours)
- ✅list_channels
- ✅list_roles
- ❌list_server_info (check admin panel instead)

**ModCommands:**
- ❌gdn_mute (defer till next bot?)
- ❌gdn_unmute (defer till next bot?)

**​No Category:**
- ✅help (added custom formatted help)
- ✅list_extensions
- ✅reload
