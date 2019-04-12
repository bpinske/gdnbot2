const moxios = require('moxios');

const AuthmeCommand = require('../src/commands/auth/authme');
const { axiosGDN, GDN_URLS } = require('../src/helpers/axiosGDN');
const { axiosGoonAuth, GOON_AUTH_URLS } = require('../src/helpers/axiosGoonAuth');
const { SA_URLS } = require('../src/helpers/axiosSA');

// Enable defining a new tag every test
let member;
let guild;
let _guildRoles;
let _guildChannels;
let message;

// Discord IDs
const guildID = '123';
const memberID = '456';
const roleID = '789';
const channelID = '987';

// Role and Channel
const authRole = {
  id: roleID,
  name: 'Auth Role'
};
const logChannel = {
  id: channelID,
  name: 'Log Channel',
  send: jest.fn()
};
const userDM = {
  awaitMessages: jest.fn()
};

// SomethingAwful user
const saUsername = 'TestGoon';
const saID = 789;

let GDN_GUILD = `${axiosGDN.defaults.baseURL}${GDN_URLS.GUILDS}/${guildID}`;
let GDN_MEMBER = `${axiosGDN.defaults.baseURL}${GDN_URLS.MEMBERS}/${memberID}`;
let GDN_SA = `${axiosGDN.defaults.baseURL}${GDN_URLS.SA}/${saID}`;
let GDN_DB = `${axiosGDN.defaults.baseURL}${GDN_URLS.MEMBERS}`;

let GAUTH_GET = `${axiosGoonAuth.defaults.baseURL}/${GOON_AUTH_URLS.GET_HASH}`;
let GAUTH_CONFIRM = `${axiosGoonAuth.defaults.baseURL}/${GOON_AUTH_URLS.CONFIRM_HASH}`;

let SA_PROFILE = `${SA_URLS.PROFILE}${saUsername}`;

let authme = new AuthmeCommand({});

beforeEach(() => {
  // An instance of a Member
  member = {
    id: memberID,
    user: {
      tag: 'foobar'
    },
    roles: [],
    edit: jest.fn(),
    send: jest.fn().mockImplementation(() => ({
      channel: userDM,
      delete: jest.fn() }))
  };

  // An instance of a Guild
  _guildRoles = [authRole];
  _guildChannels = [logChannel];

  guild = {
    id: guildID,
    name: 'Test Guild',
    roles: {
      get () { return _guildRoles; },
      set (newRoles) {},
      fetch: jest.fn().mockResolvedValue(_guildRoles[0])
    },
    channels: {
      get: jest.fn().mockResolvedValue(_guildChannels[0])
    }
  };

  // An instance of a Message
  message = {
    id: 'messageIdHere',
    guild,
    member,
    say: jest.fn()
  };
});

/**
 * Test cases testing the entire !authme command flow
 */
test('adds role to user that has never authed before', async () => {
  // Guild is enrolled in GDN
  moxios.stubRequest(GDN_GUILD, {
    status: 200,
    response: {
      validated_role_id: roleID,
      logging_channel_id: channelID
    }
  });

  // Member has never authed before
  moxios.stubRequest(GDN_MEMBER, {
    status: 404
  });

  // GoonAuth generates hash for user
  moxios.stubRequest(GAUTH_GET, {
    status: 200,
    response: {
      hash: 'abc'
    }
  });

  // User responds with "praise lowtax"
  userDM.awaitMessages.mockResolvedValue([]);

  // GoonAuth is able to find hash in SA profile
  moxios.stubRequest(GAUTH_CONFIRM, {
    status: 200,
    response: {
      validated: true
    }
  });

  // SA username returns a valid SA profile
  moxios.stubRequest(SA_PROFILE, {
    status: 200,
    response: `<input type="hidden" name="userid" value="${saID}">`
  });

  // SA ID hasn't been used by another account
  moxios.stubRequest(GDN_SA, {
    status: 404
  });

  // DB accepts new user
  moxios.stubRequest(GDN_DB, {
    status: 200
  });

  // User enters "!authme saUsername"
  await authme.run(message, { username: saUsername });

  expect(member.edit).toHaveBeenCalledWith({ roles: [authRole], reason: 'GDN: Successful Auth' });
});

test('messages channel !authme was called in when Guild is not enrolled', async () => {
  // Guild is enrolled in GDN
  moxios.stubRequest(GDN_GUILD, {
    status: 404
  });

  // User enters "!authme saUsername"
  await authme.run(message, { username: saUsername });

  expect(message.say).toHaveBeenCalledWith('This server is not enrolled in the Goon Discord Network. Please have an admin enroll the server and then activate auth.');
});

test('messages channel !authme was called in when error occurs while checking Guild enrollment', async () => {
  // Guild is enrolled in GDN
  moxios.stubRequest(GDN_GUILD, {
    status: 500
  });

  // User enters "!authme saUsername"
  await authme.run(message, { username: saUsername });

  expect(message.say).toHaveBeenCalledWith('A system error occurred while attempting to verify guild enrollment in GDN. The bot owner has been notified. Thank you for your patience while they get this fixed!');
});

test('skips hash check for user that has authed before and is not blacklisted', async () => {
  // Guild is enrolled in GDN
  moxios.stubRequest(GDN_GUILD, {
    status: 200,
    response: {
      validated_role_id: roleID,
      logging_channel_id: channelID
    }
  });

  // Member has never authed before
  moxios.stubRequest(GDN_MEMBER, {
    status: 200,
    response: {
      sa_id: saID
    }
  });

  // GoonAuth generates hash for user
  moxios.stubRequest(GDN_SA, {
    status: 200,
    response: {
      blacklisted: false
    }
  });

  // User enters "!authme saUsername"
  await authme.run(message, { username: saUsername });

  expect(member.edit).toHaveBeenCalledWith({ roles: [authRole], reason: 'GDN: Successful Auth' });
});
