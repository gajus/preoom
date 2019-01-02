/* eslint-disable no-console */

import createResourceObserver from '../factories/createResourceObserver';

const main = async () => {
  const resourceObserver = createResourceObserver();

  console.log(await resourceObserver.getPodResourceSpecification());
  console.log(await resourceObserver.getPodResourceUsage());

  resourceObserver.observe((podResourceSpecification, podResourceUsage) => {
    for (const containerResourceSpecification of podResourceSpecification.containers) {
      if (containerResourceSpecification.resources.limits && containerResourceSpecification.resources.limits.memory) {
        const containerResourceUsage = podResourceUsage.containers.find((container) => {
          return container.name === containerResourceSpecification.name;
        });

        if (!containerResourceUsage) {
          throw new Error('Unexpected state.');
        }

        if (containerResourceUsage.usage.memory / containerResourceSpecification.resources.limits.memory > 0.95) {
          console.log('shutdown service');
        }
      }
    }
  }, 5 * 1000);
};

setInterval(() => {
  console.log('ping');
}, 10 * 1000);

main();
