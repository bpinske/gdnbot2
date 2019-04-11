const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  getLogTag: id => ({ id })
};

module.exports = loggerMock;
