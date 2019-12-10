import axios from 'axios';

export interface APIConfirmHash {
  validated: boolean;
}

/**
 * An instance of Axios configured to speak with the GDN APIs over Docker's internal network
 */
export const axiosGoonAuth = axios.create({
  baseURL: 'http://goonauth:8000/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const GOON_AUTH_URLS = {
  GET_HASH: 'generate_hash/',
  CONFIRM_HASH: 'validate_user/',
};
