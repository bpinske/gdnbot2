const cleanupMessages = require('./cleanupMessages');

test('call delete on every message passed in', () => {
  const _delete = jest.fn();
  const message = { delete: _delete };

  // An array of guild and/or direct "messages"
  const messages = [message, message];

  cleanupMessages(messages);

  const callCount = _delete.mock.calls.length;

  expect(callCount).toEqual(2);
});
