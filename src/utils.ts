export function isInt(value: string = '') {
  return value.split('.').length === 1;
}

type dataType = 'string' | 'object' | 'array';
export function type(data: any): dataType {
  const reg = /[A-Z]\w+/;
  return Object.prototype.toString.call(data).match(reg)[0].toLowerCase();
}
