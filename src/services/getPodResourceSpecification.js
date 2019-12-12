// @flow

import {
  parseBytes,
  parseCpu,
} from '../utilities';
import type {
  PodResourceSpecificationType,
  HttpClientType,
} from '../types';

export default async (httpClient: HttpClientType, serviceUrl: string, podNamespace: string, podName: string): Promise<PodResourceSpecificationType> => {
  const podSpecification = await httpClient(serviceUrl + '/api/v1/namespaces/' + podNamespace + '/pods/' + podName);

  const containers = [];

  for (const container of podSpecification.spec.containers) {
    let limits = null;
    let requests = null;

    if (container.resources.limits) {
      limits = {
        cpu: container.resources.limits.cpu ? parseCpu(container.resources.limits.cpu) : null,
        memory: container.resources.limits.memory ? parseBytes(container.resources.limits.memory) : null,
      };
    }

    if (container.resources.requests) {
      requests = {
        cpu: container.resources.requests.cpu ? parseCpu(container.resources.requests.cpu) : null,
        memory: container.resources.requests.memory ? parseBytes(container.resources.requests.memory) : null,
      };
    }

    containers.push({
      name: container.name,
      resources: {
        limits,
        requests,
      },
    });
  }

  return {
    containers,
    name: podName,
  };
};
