// @flow

import test from 'ava';
import parseCpu from '../../../src/utilities/parseCpu';

test('parses input to milliCPU units', (t) => {
  t.assert(parseCpu('1') === 1000);
  t.assert(parseCpu('0.1') === 100);
  t.assert(parseCpu('500m') === 500);
});
