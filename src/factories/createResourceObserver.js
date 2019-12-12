// @flow

import {
  serializeError,
} from 'serialize-error';
import {
  getCredentials,
  getPodResourceSpecification,
  getPodResourceUsage as getUnboundPodResourceUsage,
} from '../services';
import Logger from '../Logger';
import type {
  IntervalCallbackType,
} from '../types';
import createHttpClient from './createHttpClient';

const log = Logger.child({
  namespace: 'createResourceObserver',
});

const createContext = async () => {
  const credentials = await getCredentials();
  const httpClient = await createHttpClient(
    credentials.serviceCertificateAuthority,
    credentials.serviceAccountToken,
  );
  const podResourceSpecification = await getPodResourceSpecification(
    httpClient,
    credentials.serviceUrl,
    credentials.podNamespace,
    credentials.podName,
  );

  log.debug({
    podResourceSpecification,
  }, 'pod resource specification');

  return {
    credentials,
    httpClient,
    podResourceSpecification,
  };
};

export default () => {
  const ready = createContext();

  const getPodResourceUsage = async () => {
    const context = await ready;

    const podResourceUsage = await getUnboundPodResourceUsage(
      context.httpClient,
      context.credentials.serviceUrl,
      context.credentials.podNamespace,
      context.credentials.podName,
    );

    return podResourceUsage;
  };

  return {
    getPodResourceSpecification: async () => {
      const context = await ready;

      return context.podResourceSpecification;
    },
    getPodResourceUsage,
    observe: (callback: IntervalCallbackType, interval: number) => {
      let timeout;

      const tick = async () => {
        const context = await ready;

        const podResourceSpecification = context.podResourceSpecification;

        try {
          const podResourceUsage = await getPodResourceUsage();

          log.debug({
            podResourceSpecification,
            podResourceUsage,
          }, 'observed resource usage');

          // eslint-disable-next-line callback-return
          callback(null, podResourceSpecification, podResourceUsage);
        } catch (error) {
          log.error({
            error: serializeError(error),
          }, 'cannot get resource usage');

          // eslint-disable-next-line callback-return
          callback(error, null, null);
        }

        timeout = setTimeout(() => {
          tick();
        }, interval);

        // $FlowFixMe
        timeout.unref();
      };

      tick();

      return () => {
        clearTimeout(timeout);
      };
    },
  };
};
