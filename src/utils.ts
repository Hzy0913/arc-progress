import * as React from 'react';
import { cacheType } from './arc-progress';

export function isInt(value: string = '') {
  return value.split('.').length === 1;
}

type dataType = 'string' | 'object' | 'array';
export function dataType(data: any): dataType {
  const reg = /[A-Z]\w+/;
  return Object.prototype.toString.call(data).match(reg)[0].toLowerCase();
}

interface SetCacheType {
  (option: cacheType): void;
}
export function useCacheState(): [cacheType, SetCacheType] {
  const cache: cacheType = {
    prevProgress: undefined,
    prevText: undefined,
    currentText: undefined,
    fillImage: undefined,
    isEnd: false,
    percentage: 0,
    textValue: 0,
  };
  const [cacheState, setCacheState] = React.useState(cache);

  function setCache(option: cacheType = {}): void {
    Object.keys(option).forEach(key => cacheState[key] = option[key]);
    setCacheState({ ...cacheState });
  }

  return [cacheState, setCache];
}
