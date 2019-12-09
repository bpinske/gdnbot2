jest.unmock('./logger');
// eslint-disable-next-line import/first
import logger, { getLogTag } from './logger';

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

  test('getLogTag returns an object with provided id as req_id', () => {
    const tag = getLogTag('123');

    const returned = JSON.stringify(tag);
    const expected = JSON.stringify({ req_id: '123' });

    expect(returned).toMatch(expected);
  });
});
