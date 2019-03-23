const mockAxios = require('jest-mock-axios');

mockAxios.create = jest.fn();

module.exports = mockAxios;
