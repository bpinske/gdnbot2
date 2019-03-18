/**
 * A helper method to clean up Guild and DM messages
 *
 * @param {array} messages - An array of messages
 */
const cleanupMessages = (messages) => {
  messages.forEach((msg) => {
    msg.delete();
  });
};

module.exports = cleanupMessages;
