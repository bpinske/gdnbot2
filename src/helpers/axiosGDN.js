const axios = require('axios');

/**
 * An instance of Axios configured to speak with the GDN APIs over Docker's internal network
 */
const axiosGDN = axios.create({
  baseURL: 'http://gdn',
  headers: {
    'Authorization': `Token ${process.env.GDN_API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const GDN_URLS = {
  MEMBERS: '/gdn/members',
  GUILDS: '/gdn/servers',
  SA: 'gdn/sa'
};

module.exports = {
  axiosGDN,
  GDN_URLS
};
