// @flow

import {
  parse as parseBytes,
} from 'bytes-iec';

export default (iecBytes: string) => {
  const bytes = parseBytes(iecBytes.endsWith('B') ? iecBytes : iecBytes + 'B');

  if (bytes === null) {
    throw new Error('Unexpected input.');
  }

  return bytes;
};
