/**
 * Update the number of enrolled servers in the bot's activity
 *
 * @param {Client} bot
 */
const updateEnrolledServersCount = bot => () => {
  const totalGuilds = bot.guilds.size;
  bot.user.setActivity(`in ${totalGuilds} enrolled servers`);
};

module.exports = updateEnrolledServersCount;
