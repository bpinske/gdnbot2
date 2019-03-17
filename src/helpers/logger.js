const winston = require('winston');
const { PaperTrail } = require('winston-papertrail');

const logger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.Console()
  ]
});

if (process.env.NODE_ENV === 'production') {
  const transportPapertrail = new PaperTrail({
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT
  });

  transportPapertrail.on('error', (err) => {
    console.error('error sending to Papertrail:', err);
  });

  logger.add(transportPapertrail);
}

module.exports = logger;
