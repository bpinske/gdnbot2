const moxios = require('moxios');
jest.mock('../../logger');

const {
  GDN_URLS,
  axiosGDN
} = require('../../');

const canMemberAuth = require('./canMemberAuth');

let tag;
const member = {
  name: 'foobar',
  id: 123
};
const saID = 456;

let API_URL = `${axiosGDN.defaults.baseURL}${GDN_URLS.MEMBERS}/${member.id}`;
let SA_URL = `${axiosGDN.defaults.baseURL}${GDN_URLS.SA}/${saID}`;

beforeEach(() => {
  tag = { tag: Date.now() };
  moxios.install(axiosGDN);
});

afterEach(() => {
  moxios.uninstall(axiosGDN);
});

test('send a GET to the GDN API to check for member by ID', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {
      sa_id: saID
    }
  });
  moxios.stubRequest(SA_URL, {});

  await canMemberAuth({ tag, member });
  const req = moxios.requests.at(0);
  expect(req.url).toMatch(/\/gdn\/members\/1/);
});

test('return true when member exists on server and is not blacklisted', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {
      sa_id: saID
    }
  });
  moxios.stubRequest(SA_URL, {
    status: 200,
    response: {
      blacklisted: false
    }
  });

  const { canAuth } = await canMemberAuth({ tag, member });
  expect(canAuth).toEqual(true);
});

test('return true when member does not exist on server', async () => {
  moxios.stubRequest(API_URL, {
    status: 404,
    response: {}
  });

  const { canAuth } = await canMemberAuth({ tag, member });
  expect(canAuth).toEqual(true);
});

test('return false when member exists on server but is blacklisted', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {
      sa_id: saID
    }
  });
  moxios.stubRequest(SA_URL, {
    status: 200,
    response: {
      blacklisted: true
    }
  });

  const { canAuth } = await canMemberAuth({ tag, member });
  expect(canAuth).toEqual(false);
});

test('return false when server error occurs when requesting member by ID', async () => {
  moxios.stubRequest(API_URL, {
    status: 500,
    response: {}
  });

  const { canAuth } = await canMemberAuth({ tag, member });
  expect(canAuth).toEqual(false);
});

test('return reason when server error occurs when requesting member by ID', async () => {
  moxios.stubRequest(API_URL, {
    status: 500,
    response: {}
  });

  const { reason } = await canMemberAuth({ tag, member });
  expect(reason).toMatch(/An error occurred/);
});

test('return false when server error occurs when requesting member by SA ID', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {
      sa_id: saID
    }
  });
  moxios.stubRequest(SA_URL, {
    status: 500,
    response: {}
  });

  const { canAuth } = await canMemberAuth({ tag, member });
  expect(canAuth).toEqual(false);
});

test('return reason when server error occurs when requesting member by SA ID', async () => {
  moxios.stubRequest(API_URL, {
    status: 200,
    response: {
      sa_id: saID
    }
  });
  moxios.stubRequest(SA_URL, {
    status: 500,
    response: {}
  });

  const { reason } = await canMemberAuth({ tag, member });
  expect(reason).toMatch(/An error occurred/);
});
