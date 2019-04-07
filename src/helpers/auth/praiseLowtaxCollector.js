const filter = text => text.content.toLowerCase() === 'praise lowtax';
const collectorOptions = {
  max: 1,
  maxProcessed: 3,
  errors: ['time'],
  time: 300000 // milliseconds (5 minutes)
};

/**
 * A collector specifically for requesting the user to type 'praise lowtax' after
 * adding the auth hash to their SA profile. This should trigger the verification step of the
 * authme process.
 *
 * @returns {Promise} - { cancelled, values? }
 */
const praiseLowtaxCollector = async ({ channel }) => {
  return channel.awaitMessages(filter, collectorOptions)
    .then((collected) => ({ cancelled: false }))
    .catch((collected) => ({ cancelled: true }));
};

module.exports = praiseLowtaxCollector;
