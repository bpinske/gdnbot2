const bunyan = require('bunyan');

let logger = require('./logger');

// Values for matching
const papertrailHost = 'papertrail.com';
const papertrailPort = '123';

// Set known values so we can test that they're set properly
process.env.PAPERTRAIL_HOST = papertrailHost;
process.env.PAPERTRAIL_PORT = papertrailPort;

describe('standard functionality', () => {
  test('set logger name to gdnbot2', () => {
    expect(logger.fields.name).toEqual('gdnbot2');
  });

  test('output INFO logs to console', () => {
    const consoleStream = logger.streams.find(strm => strm.type === 'stream');

    expect(consoleStream).not.toBeUndefined();
    expect(consoleStream.level).toBeGreaterThanOrEqual(bunyan.INFO);
  });

  test('output DEBUG logs to rotating file', () => {
    const consoleStream = logger.streams.find(strm => strm.type === 'rotating-file');

    expect(consoleStream).not.toBeUndefined();
    expect(consoleStream.level).toBeGreaterThanOrEqual(bunyan.DEBUG);
  });

  test('set error serializer to default bunyan err serializer', () => {
    expect(logger.serializers.err).toEqual(bunyan.stdSerializers.err);
  });

  test('set logger error handler that logs to console', () => {
    const errorHandler = logger._events.error;
    console.error = jest.fn();

    errorHandler('foobar');

    expect(console.error.mock.calls[0][0]).toMatch(/error occurred/i);
  });

  test('does not output logs to Papertrail', () => {
    const papertrail = logger.streams.find(strm => strm.type === 'raw');

    expect(papertrail).toBeUndefined();
  });

  test('getLogTag returns an object with provided id as req_id', () => {
    const tag = logger.getLogTag(123);

    const returned = JSON.stringify(tag);
    const expected = JSON.stringify({ req_id: 123 });

    expect(returned).toMatch(expected);
  });
});

describe('production-specific functionality', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    logger = require('./logger');
  });

  test('output DEBUG logs to Papertrail', () => {
    const papertrail = logger.streams.find(strm => strm.type === 'raw');
    const stream = papertrail.stream;

    expect(papertrail).not.toBeUndefined();
    expect(papertrail.level).toBeGreaterThanOrEqual(bunyan.DEBUG);
    expect(stream.host).toEqual(papertrailHost);
    expect(stream.port).toEqual(parseInt(papertrailPort, 10));
  });
});
