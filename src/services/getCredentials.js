// @flow

/* eslint-disable process-env */

import fs from 'fs';

type CredentialsType = {|
  +podName: string,
  +podNamespace: string,
  +serviceAccountToken: string,
  +serviceCertificateAuthority: string,
  +serviceUrl: string,
|};

const read = (filePath: string): string | null => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    return null;
  }
};

export default () => {
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
    podName: 'showtime-api-56568dd94-tz8df',
    podNamespace,
    serviceAccountToken,
    serviceCertificateAuthority,
    serviceUrl,
  };
};
