const moxios = require('moxios');
jest.mock('../../logger');

const {
  GDN_URLS,
  axiosGDN
} = require('../../');

const hasGuildEnrolled = require('./hasGuildEnrolled');

let tag;
const guild = {
  name: 'foobar',
  id: 1
};
let API_URL = `${axiosGDN.defaults.baseURL}${GDN_URLS.GUILDS}/${guild.id}`;

beforeEach(() => {
  tag = { tag: Date.now() };
  moxios.install(axiosGDN);
});

afterEach(() => {
  moxios.uninstall(axiosGDN);
});

test('send a GET to the GDN API to check for server by ID', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {}
  });
  await hasGuildEnrolled({ tag, guild });
  const req = moxios.requests.mostRecent();
  expect(req.url).toMatch(/\/gdn\/servers\/1/);
});

test('return true when server is enrolled', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {}
  });
  const { isEnrolled } = await hasGuildEnrolled({ tag, guild });
  expect(isEnrolled).toEqual(true);
});

test('return roleId when server is enrolled', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {
      validated_role_id: 1
    }
  });
  const { roleId } = await hasGuildEnrolled({ tag, guild });
  expect(roleId).toEqual(1);
});

test('return channelId when server is enrolled', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {
      logging_channel_id: 2
    }
  });
  const { channelId } = await hasGuildEnrolled({ tag, guild });
  expect(channelId).toEqual(2);
});

test('return false when server is not found', async () => {
  moxios.stubRequest(API_URL, {
    status: 404
  });

  const { isEnrolled } = await hasGuildEnrolled({ tag, guild });
  expect(isEnrolled).toEqual(false);
});

test('return reason when server is not found', async () => {
  moxios.stubRequest(API_URL, {
    status: 404
  });

  const { reason } = await hasGuildEnrolled({ tag, guild });
  expect(reason).toMatch(/server is not enrolled/i);
});

test('return false when API server error occurs', async () => {
  moxios.stubRequest(API_URL, {
    status: 500
  });

  const { isEnrolled } = await hasGuildEnrolled({ tag, guild });
  expect(isEnrolled).toEqual(false);
});

test('return API server error reason when unexpected response received', async () => {
  moxios.stubRequest(API_URL, {
    status: 500
  });

  const { reason } = await hasGuildEnrolled({ tag, guild });
  expect(reason).toMatch(/error occurred/i);
});
