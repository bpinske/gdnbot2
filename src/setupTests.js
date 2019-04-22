// Read in the .env file
require('dotenv').config();

const moxios = require('moxios');

const { axiosGDN } = require('./helpers/axiosGDN');
const { axiosGoonAuth } = require('./helpers/axiosGoonAuth');
const { axiosSA } = require('./helpers/axiosSA');

// Mock discord.js-commando classes and whatnot
jest.mock('discord.js-commando');

// Prevent logger console output
jest.mock('../src/helpers/logger');

// Mock out the various axios instances so we can mock API responses/rejections
beforeEach(() => {
  moxios.install(axiosGDN);
  moxios.install(axiosGoonAuth);
  moxios.install(axiosSA);
});

afterEach(() => {
  moxios.uninstall(axiosGDN);
  moxios.uninstall(axiosGoonAuth);
  moxios.uninstall(axiosSA);

  // Reset all mock calls
  jest.clearAllMocks();
});
