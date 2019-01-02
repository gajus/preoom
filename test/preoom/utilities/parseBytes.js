// @flow

import test from 'ava';
import parseBytes from '../../../src/utilities/parseBytes';

test('parses abbreviated notations Ki, Mi, Gi', (t) => {
  t.true(parseBytes('1Ki') === 1024);
  t.true(parseBytes('1Mi') === 1048576);
  t.true(parseBytes('1Gi') === 1073741824);
});

test('parses regular notations KiB, MiB, GiB', (t) => {
  t.true(parseBytes('1Ki') === 1024);
  t.true(parseBytes('1Mi') === 1048576);
  t.true(parseBytes('1Gi') === 1073741824);
});
