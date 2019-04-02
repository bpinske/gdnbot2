const axios = require('axios');

/**
 * An instance of Axios configured to speak with the GDN APIs over Docker's internal network
 */
const axiosGoonAuth = axios.create({
  baseURL: 'http://goonauth:8000/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const GOON_AUTH_URLS = {
  GET_HASH: 'generate_hash/',
  CONFIRM_HASH: 'validate_user/'
};

module.exports = {
  axiosGoonAuth,
  GOON_AUTH_URLS
};
