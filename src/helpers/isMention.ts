const ownerRegex = /^<@!(\d+)>/;

/**
 * Check to see if the message content starts with a mention of the given ID
 */
export default function isMention (msgContent: string, userID: string): boolean {
  const mentionedID = ownerRegex.exec(msgContent);

  return !!mentionedID && mentionedID[1] === userID;
}
