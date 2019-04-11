const axios = require('axios');

const COOKIES = {
  sessionid: process.env.SESSION_ID,
  sessionhash: process.env.SESSION_HASH,
  bbuserid: process.env.BBUSER_ID,
  bbpassword: process.env.BBPASSWORD
};

// Format the above cookies into a value suitable for use as the Cookie header
const Cookie = Object.entries(COOKIES).map(([key, val]) => `${key}=${val}`).join('; ');

// Prepare an Axios client with SA user cookies
const axiosSA = axios.create({
  headers: {
    Cookie
  }
});

const SA_URLS = {
  PROFILE: 'http://forums.somethingawful.com/member.php?action=getinfo&username='
};

module.exports = {
  axiosSA,
  SA_URLS
};
