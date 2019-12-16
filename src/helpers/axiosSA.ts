import axios from 'axios';

import { SESSION_ID, SESSION_HASH, BBUSER_ID, BBPASSWORD } from './constants';

const COOKIES = {
  sessionid: SESSION_ID,
  sessionhash: SESSION_HASH,
  bbuserid: BBUSER_ID,
  bbpassword: BBPASSWORD,
};

// Format the above cookies into a value suitable for use as the Cookie header
const Cookie = Object.entries(COOKIES).map(([key, val]) => `${key}=${val}`).join('; ');

// Prepare an Axios client with SA user cookies
export const axiosSA = axios.create({
  headers: {
    Cookie,
  },
});

export const SA_URLS = {
  PROFILE: 'http://forums.somethingawful.com/member.php?action=getinfo&username=',
};
