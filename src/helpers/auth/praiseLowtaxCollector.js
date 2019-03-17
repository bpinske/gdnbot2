const { ArgumentCollector } = require('discord.js-commando');

/**
 * An ArgumentCollector specifically for requesting the user to type 'praise lowtax' after
 * adding the auth hash to their SA profile. This should trigger the verification step of the
 * authme process.
 *
 * ArgumentCollector is a Promise. It returns an object (`confirmation` below) containing values
 * that can be used to confirm the user followed through as expected:
 *
 * - `confirmation.values` can be null, or an object with properties matching the `key`s specified
 *   in each argument. This should only be used if `cancelled` below is falsy
 * - `confirmation.cancelled` can be null, `user`, or `time`. Any value here indicates that the
 *   user didn't reply as expected.
 */
const praiseLowtaxCollector = new ArgumentCollector(
  this.client,
  [{
    key: 'praise',
    prompt: 'Type "**praise Lowtax**" to continue',
    type: 'string',
    validate: text => text.toLowerCase() === 'praise lowtax',
    wait: 300 // seconds
  }],
  3
);

module.exports = praiseLowtaxCollector;
