# Preoom 🧐

[![Travis build status](http://img.shields.io/travis/gajus/preoom/master.svg?style=flat-square)](https://travis-ci.org/gajus/preoom)
[![Coveralls](https://img.shields.io/coveralls/gajus/preoom.svg?style=flat-square)](https://coveralls.io/github/gajus/preoom)
[![NPM version](http://img.shields.io/npm/v/preoom.svg?style=flat-square)](https://www.npmjs.org/package/preoom)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Retrieves & observes Kubernetes Pod resource (CPU, memory) utilisation.

* [Use case](#use-case)
* [Requirements](#requirements)
* [Usage](#usage)
  * [Using Preoom with Lightship to gracefully shutdown service before the OOM termination](#using-preoom-with-lightship-to-gracefully-shutdown-service-before-the-oom-termination)
* [Related projects](#related-projects)

## Use case

If node experiences a system OOM (out of memory) event prior to the `kubelet` being able to reclaim memory, then `oom_killer` identifies and kills containers with the lowest quality of service that are consuming the largest amount of memory relative to the scheduling request.

These pods will be terminated and termination reason will be "OOMKilled", e.g.

```
Last State:   Terminated
Reason:       OOMKilled
Exit Code:    137

```

The problem is that [Kubernetes OOM termination is performed using SIGKILL](https://github.com/kubernetes/kubernetes/issues/40157), i.e. Pod is not given time for graceful shutdown.

Preoom allows to set up a regular check for memory usage and gracefully shutdown the Kubernetes Pod before the OOM termination occurs (see [Using Preoom with Lightship to gracefully shutdown service before the OOM termination](#using-preoom-with-lightship-to-gracefully-shutdown-service-before-the-oom-termination)).

## Requirements

[Kubernetes Metrics Server](https://github.com/kubernetes-incubator/metrics-server) must be available in the cluster and the metrics.k8s.io API must be accessible by the anonymous service account.

## Usage

```js
import {
  createResourceObserver,
  isKubernetesCredentialsPresent
} from 'preoom';

const main = async () => {
  const resourceObserver = createResourceObserver();

  if (isKubernetesCredentialsPresent()) {
    console.log(await resourceObserver.getPodResourceSpecification());

    // {
    //   containers: [
    //     {
    //       name: 'authentication-proxy',
    //       resources: {
    //         limits: {
    //           cpu: 500',
    //           memory: 536870912
    //         },
    //         requests: {
    //           cpu: 250,
    //           memory: 268435456
    //         }
    //       }
    //     },
    //     {
    //       name: 'monitoring-proxy',
    //       resources: {
    //         limits: {
    //           cpu: 1000',
    //           memory: 536870912
    //         },
    //         requests: {
    //           cpu: 500,
    //           memory: 268435456
    //         }
    //       }
    //     },
    //     {
    //       name: 'showtime-api',
    //       resources: {
    //         limits: {
    //           cpu: 2000,
    //           memory: 2147483648
    //         },
    //         requests: {
    //           cpu: 1000,
    //           memory: 1073741824
    //         }
    //       }
    //     }
    //   ],
    //   name: 'showtime-api-56568dd94-tz8df'
    // }

    console.log(await resourceObserver.getPodResourceUsage());

    // {
    //   containers: [
    //     {
    //       name: 'authentication-proxy',
    //       usage: {
    //         cpu: 0,
    //         memory: 101044224
    //       }
    //     },
    //     {
    //       name: 'monitoring-proxy',
    //       usage: {
    //         cpu: 1000,
    //         memory: 42151936
    //       }
    //     },
    //     {
    //       name: 'showtime-api',
    //       usage: {
    //         cpu: 0,
    //         memory: 1349738496
    //       }
    //     }
    //   ],
    //   name: 'showtime-api-56568dd94-tz8df'
    // }
  }
};

main();

```

### Using Preoom with Lightship to gracefully shutdown service before the OOM termination

Preoom allows to set up a regular check for memory usage and gracefully shutdown the Kubernetes Pod before the OOM termination occurs. Graceful termination can be implemented using [Lightship](https://github.com/gajus/lightship), e.g.

```js
import {
  createLightship
} from 'lightship';
import {
  createResourceObserver,
  isKubernetesCredentialsPresent
} from 'preoom';

const MAXIMUM_MEMORY_USAGE = 0.95;

const main = async () => {
  const lightship = createLightship();

  if (isKubernetesCredentialsPresent()) {
    const resourceObserver = createResourceObserver();

    resourceObserver.observe((error, podResourceSpecification, podResourceUsage) => {
      if (error) {
        // Handle error.
      } else {
        for (const containerResourceSpecification of podResourceSpecification.containers) {
          if (containerResourceSpecification.resources.limits && containerResourceSpecification.resources.limits.memory) {
            const containerResourceUsage = podResourceUsage.containers.find((container) => {
              return container.name === containerResourceSpecification.name;
            });

            if (!containerResourceUsage) {
              throw new Error('Unexpected state.');
            }

            if (containerResourceUsage.usage.memory / containerResourceSpecification.resources.limits.memory > MAXIMUM_MEMORY_USAGE) {
              lightship.shutdown();
            }
          }
        }
      }
    }, 5 * 1000);
  }

  lightship.signalReady();
}

main();

```

## Units

* CPUs are reported as milliCPU units (1000 = 1 CPU).
* Memory is reported in bytes.

## Related projects

* [Iapetus](https://github.com/gajus/iapetus) – Prometheus metrics server.
* [Lightship](https://github.com/gajus/lightship) – Abstracts readiness/ liveness checks and graceful shutdown of Node.js services running in Kubernetes.
