// jest.mock('../../logger');

const isValidAuthRole = require('./isValidAuthRole');

const validRoleId = '123';

// Pretend this is a ChannelStore that might check the API for channels by ID
const simpleRoleMatch = jest.fn().mockImplementation(
  (id) => Promise.resolve(id === validRoleId ? { name: 'foobar' } : undefined)
);

let tag;
const guild = {
  roles: {
    fetch: jest.fn(simpleRoleMatch)
  }
};

beforeEach(() => {
  // Create a new tag for each test
  tag = { tag: Date.now() };
});

test('return false when an invalid role ID is passed in', async () => {
  const { isValid } = await isValidAuthRole({ tag, guild });

  expect(isValid).toEqual(false);
});

test('return a reason when an invalid role ID is passed in', async () => {
  const { reason } = await isValidAuthRole({ tag, guild });

  expect(reason).toBeTruthy();
});

test('return true when a valid role ID is passed in', async () => {
  const { isValid } = await isValidAuthRole({ tag, guild, roleId: validRoleId });

  expect(isValid).toEqual(true);
});

test('return the validated role when a valid role ID is passed in', async () => {
  const { validatedRole } = await isValidAuthRole({ tag, guild, roleId: validRoleId });

  expect(validatedRole).not.toBeUndefined();
});

test('return channel when passed a valid ID of type Number', async () => {
  const { validatedRole } = await isValidAuthRole({ tag, guild, roleId: parseInt(validRoleId, 10) });

  expect(validatedRole).not.toBeUndefined();
});
