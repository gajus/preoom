// @flow

import got from 'got';
import type {
  HttpClientType
} from '../types';

export default (certificateAuthority: string, serviceAccountToken: string): HttpClientType => {
  return async (url: string) => {
    const response = await got(url, {
      agent: false,
      ca: [
        certificateAuthority
      ],
      headers: {
        Authorization: 'Bearer ' + serviceAccountToken
      },
      json: true,
      rejectUnauthorized: true,
      requestCert: true
    });

    return response.body;
  };
};
