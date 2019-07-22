// @flow

export default (input: string): number => {
  // '500m'
  if (String(input).endsWith('m')) {
    return parseInt(input.slice(0, -1), 10);
  }

  // '1' or '0.1'
  return Math.round(parseFloat(String(input)) * 1000);
};
