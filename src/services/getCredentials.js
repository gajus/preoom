// @flow

/* eslint-disable no-process-env */

import {
  read,
} from '../utilities';

type CredentialsType = {|
  +podName: string,
  +podNamespace: string,
  +serviceAccountToken: string,
  +serviceCertificateAuthority: string,
  +serviceUrl: string,
|};

export default (): CredentialsType => {
  const kubernetesServiceHost = process.env.KUBERNETES_SERVICE_HOST || null;
  const kubernetesServicePort = process.env.KUBERNETES_PORT_443_TCP_PORT || null;
  const podName = process.env.HOSTNAME || null;

  if (!kubernetesServiceHost) {
    throw new Error('Cannot read container environment variables (KUBERNETES_SERVICE_HOST).');
  }

  if (!kubernetesServicePort) {
    throw new Error('Cannot read container environment variables (KUBERNETES_PORT_443_TCP_PORT).');
  }

  if (!podName) {
    throw new Error('Cannot read container environment variables (HOSTNAME).');
  }

  const serviceAccountToken = read('/var/run/secrets/kubernetes.io/serviceaccount/token');
  const serviceCertificateAuthority = read('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt');
  const podNamespace = read('/var/run/secrets/kubernetes.io/serviceaccount/namespace');

  if (!serviceAccountToken) {
    throw new Error('Cannot read service account credentials (token).');
  }

  if (!serviceCertificateAuthority) {
    throw new Error('Cannot read service account credentials (ca).');
  }

  if (!podNamespace) {
    throw new Error('Cannot read service account credentials (namespace).');
  }

  const serviceUrl = 'https://' + kubernetesServiceHost + ':' + kubernetesServicePort;

  return {
    podName,
    podNamespace,
    serviceAccountToken,
    serviceCertificateAuthority,
    serviceUrl,
  };
};
