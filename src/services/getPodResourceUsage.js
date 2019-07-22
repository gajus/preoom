// @flow

import {
  parseBytes,
  parseCpu
} from '../utilities';
import type {
  PodResourceUsageType,
  HttpClientType
} from '../types';

export default async (httpClient: HttpClientType, serviceUrl: string, podNamespace: string, podName: string): Promise<PodResourceUsageType> => {
  const podMetrics = await httpClient(serviceUrl + '/apis/metrics.k8s.io/v1beta1/namespaces/' + podNamespace + '/pods/' + podName);

  const containers = [];

  for (const container of podMetrics.containers) {
    containers.push({
      name: container.name,
      usage: {
        cpu: parseCpu(container.usage.cpu),
        memory: parseBytes(container.usage.memory)
      }
    });
  }

  return {
    containers,
    name: podName
  };
};
