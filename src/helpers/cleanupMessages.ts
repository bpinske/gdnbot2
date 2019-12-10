import { Message } from 'discord.js';

/**
 * A helper method to clean up Guild and DM messages
 *
 * @param {array} messages - An array of messages
 */
export default function cleanupMessages (messages: Message[]): void {
  messages.forEach((msg) => {
    msg.delete();
  });
}
