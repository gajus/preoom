// @flow

/* eslint-disable no-process-env */

import read from './read';

export default () => {
  const kubernetesServiceHost = process.env.KUBERNETES_SERVICE_HOST || null;
  const kubernetesServicePort = process.env.KUBERNETES_PORT_443_TCP_PORT || null;
  const podName = process.env.HOSTNAME || null;

  if (!kubernetesServiceHost || !kubernetesServicePort || !podName) {
    return false;
  }

  const serviceAccountToken = read('/var/run/secrets/kubernetes.io/serviceaccount/token');
  const serviceCertificateAuthority = read('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt');
  const podNamespace = read('/var/run/secrets/kubernetes.io/serviceaccount/namespace');

  return serviceAccountToken && serviceCertificateAuthority && podNamespace;
};
