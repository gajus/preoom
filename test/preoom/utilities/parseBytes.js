// @flow

import test from 'ava';
import parseBytes from '../../../src/utilities/parseBytes';

test('parses abbreviated notations Ki, Mi, Gi', (t) => {
  t.assert(parseBytes('1Ki') === 1024);
  t.assert(parseBytes('1Mi') === 1048576);
  t.assert(parseBytes('1Gi') === 1073741824);
});

test('parses regular notations KiB, MiB, GiB', (t) => {
  t.assert(parseBytes('1Ki') === 1024);
  t.assert(parseBytes('1Mi') === 1048576);
  t.assert(parseBytes('1Gi') === 1073741824);
});
