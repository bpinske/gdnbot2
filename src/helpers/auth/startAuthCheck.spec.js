jest.mock('../logger');
jest.mock('./checks/hasGuildEnrolled');
jest.mock('./checks/canMemberAuth');
jest.mock('./checks/isValidAuthRole');
jest.mock('./checks/isValidLogChannel');

const logger = require('../logger');
const hasGuildEnrolled = require('./checks/hasGuildEnrolled');
const canMemberAuth = require('./checks/canMemberAuth');
const isValidAuthRole = require('./checks/isValidAuthRole');
const isValidLogChannel = require('./checks/isValidLogChannel');

// The actual module we're testing
const startAuthCheck = require('./startAuthCheck');

let tag;
const guild = {
  name: 'foobar',
  id: 1
};
const member = {
  user: {
    tag: 'fizzbuzz'
  },
  id: 2
};
const isAuthMe = false;

/**
 * Mock implementations for the checks that lead to a happy path
 */
hasGuildEnrolled.mockImplementation(() => ({
  isEnrolled: true,
  roleId: 123,
  channelId: 456
}));

canMemberAuth.mockImplementation(() => ({
  canAuth: true
}));

const _validatedRole = {
  name: 'authRole',
  id: 123
};
isValidAuthRole.mockImplementation(() => ({
  isValid: true,
  validatedRole: _validatedRole
}));

const _validatedChannel = {
  name: 'logChannel',
  id: 456
};
isValidLogChannel.mockImplementation(() => ({
  validatedChannel: _validatedChannel
}));

beforeEach(() => {
  tag = { tag: Date.now() };
});

test('log tag, member name, member ID, guild name, and guild ID on start', async () => {
  await startAuthCheck({ tag, guild, member, isAuthMe });

  const [_tag, _message] = logger.info.mock.calls[0];

  // request tag
  expect(_tag).toEqual(tag);
  expect(_message).toMatch(`${guild.name} (${guild.id})`);
  expect(_message).toMatch(`${member.user.tag} (${member.id})`);
});

test('return true, auth role, and log channel when all checks pass', async () => {
  const { canProceed, validatedRole, validatedChannel } = await startAuthCheck({ tag, guild, member, isAuthMe });

  const returned = JSON.stringify({ canProceed, validatedRole, validatedChannel });
  const truth = JSON.stringify({
    canProceed: true,
    validatedRole: _validatedRole,
    validatedChannel: _validatedChannel
  });

  expect(returned).toEqual(truth);
});

test('returns false and reason when guild has not enrolled in GDN', async () => {
  const _reason = 'guild is not in GDN';
  hasGuildEnrolled.mockImplementationOnce(() => ({
    isEnrolled: false,
    reason: _reason
  }));

  const { canProceed, reason } = await startAuthCheck({ tag, guild, member, isAuthMe });

  const returned = JSON.stringify({ canProceed, reason });
  const truth = JSON.stringify({ canProceed: false, reason: _reason });

  expect(returned).toEqual(truth);
});

test('returns false and reason when member cannot auth', async () => {
  const _reason = 'member cannot auth';
  canMemberAuth.mockImplementationOnce(() => ({
    canAuth: false,
    reason: _reason
  }));

  const { canProceed, reason } = await startAuthCheck({ tag, guild, member, isAuthMe });

  const returned = JSON.stringify({ canProceed, reason });
  const truth = JSON.stringify({ canProceed: false, reason: _reason });

  expect(returned).toEqual(truth);
});

test('returns false and reason when valid role is not available', async () => {
  const _reason = 'role ID is invalid';
  isValidAuthRole.mockImplementationOnce(() => ({
    isValid: false,
    reason: _reason
  }));

  const { canProceed, reason } = await startAuthCheck({ tag, guild, member, isAuthMe });

  const returned = JSON.stringify({ canProceed, reason });
  const truth = JSON.stringify({ canProceed: false, reason: _reason });

  expect(returned).toEqual(truth);
});

test('returns true but undefined channel when channel is not valid or misconfigured', async () => {
  isValidLogChannel.mockImplementationOnce(() => ({
    validatedChannel: undefined
  }));

  const { canProceed, validatedChannel } = await startAuthCheck({ tag, guild, member, isAuthMe });

  const returned = JSON.stringify({ canProceed, validatedChannel });
  const truth = JSON.stringify({ canProceed: true, validatedChannel: undefined });

  expect(returned).toEqual(truth);
});
