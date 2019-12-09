import { DMChannel, CollectorFilter, AwaitMessagesOptions } from 'discord.js';

interface CollectorResults {
  cancelled: boolean;
}

const filter: CollectorFilter = text => text.content.toLowerCase() === 'praise lowtax';
const collectorOptions: AwaitMessagesOptions = {
  max: 1,
  maxProcessed: 3,
  errors: ['time'],
  // milliseconds (5 minutes)
  time: 300000,
};

/**
 * A collector specifically for requesting the user to type 'praise lowtax' after
 * adding the auth hash to their SA profile. This should trigger the verification step of the
 * authme process.
 */
export default async function praiseLowtaxCollector (channel: DMChannel): Promise<CollectorResults> {
  return channel.awaitMessages(filter, collectorOptions)
    .then(() => ({ cancelled: false }))
    .catch(() => ({ cancelled: true }));
}
