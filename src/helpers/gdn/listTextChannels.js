/**
 * List all of the guild's TextChannels
 *
 * @param {Guild} guild
 * @returns {ChannelStore}
 */
const listTextChannels = guild => guild.channels.filter(channel => channel.type === 'text');

module.exports = listTextChannels;
