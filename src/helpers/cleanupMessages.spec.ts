import cleanupMessages from './cleanupMessages';
import { Message } from 'discord.js';

test('call delete on every message passed in', () => {
  const _delete = jest.fn();
  const message: unknown = { delete: _delete };

  // An array of guild and/or direct "messages"
  const messages: unknown[] = [message, message];

  cleanupMessages((messages as Message[]));

  const callCount = _delete.mock.calls.length;

  expect(callCount).toEqual(2);
});
