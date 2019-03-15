const extHelp = require('../extensions/help');
const extAuthme = require('../extensions/authme');

// A list of extensions to load when initializing the bot
const extensions = [
  extHelp,
  extAuthme
];

// Add event handlers for each extension
const loadExtensions = (bot) => {
  for (let ext of extensions) {
    bot.commands.set(ext.name, ext);
  }
};

module.exports = loadExtensions;
