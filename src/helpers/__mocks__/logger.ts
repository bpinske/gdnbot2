export const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export const getLogTag = (id: string) => ({ req_id: id });
