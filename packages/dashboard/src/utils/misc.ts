import {
  is,
  flatten,
  match,
  map,
  values,
  dropRepeats,
  fromPairs,
  toPairs,
  unnest,
  pair,
} from 'ramda';
import jVar from 'json-variables';
import {DataSourceDefinition} from './dataSourceUtils';

export const getTokenFromString = (s:string):string[] => {
  const isString = is(String);
  if (!isString(s)) {
    return [];
  }
  const tokensRaw = match(/\{(.*?)\}/g, s);
  const tokens = map((str) => `${str.substr(1, str.length - 2)}`, tokensRaw);
  return tokens;
};



export const flatObject: (obj: DataSourceDefinition) => object = (obj) => {

  const getEntries: (o: DataSourceDefinition | number | string, prefix?: string) => [string,unknown][] = (o, prefix = '') =>
      unnest(map(([k, v]:[string, DataSourceDefinition|string|number]) =>{
        if(is(Object, v)){
          const entryObject = v as DataSourceDefinition;
          return getEntries(entryObject, `${prefix}${k}.`)
        }  
        return [pair(`${prefix}${k}`, v)] 
      }, toPairs(o as DataSourceDefinition )));

  return fromPairs(getEntries(obj));
};

export const getTokensArrayFromConfig: (obj: DataSourceDefinition) => string[] = (obj) => {
  const flattenedObject = flatObject(obj);
  const tokensRaw = flatten(map(getTokenFromString, values(flattenedObject)));
  const tokens = dropRepeats(tokensRaw);
  return tokens;
};

export const renderJson = (obj) =>
  jVar(obj, {
    heads: '{',
    tails: '}',
  });

export function loadComponent(scope, module) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__('default');
    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}


export default null;