/**
 * Update the number of enrolled servers in the bot's activity
 *
 * @param {Client} bot
 */
const updateEnrolledServersCount = async ({ bot }) => {
  const totalGuilds = bot.guilds.size;
  await bot.user.setActivity(`in ${totalGuilds} enrolled servers`);
};

module.exports = updateEnrolledServersCount;
