export function isInt(value: string = '') {
  return value.split('.').length === 1;
}
