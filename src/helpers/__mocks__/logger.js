const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  getLogTag: id => ({ req_id: id })
};

module.exports = loggerMock;
