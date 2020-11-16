import {
  is,
  flatten,
  match,
  map,
  values,
  dropRepeats,
} from 'ramda';
import jVar from 'json-variables';

export const getTokenFromString = (s) => {
  const isString = is(String);
  if (!isString(s)) {
    return [];
  }
  const tokensRaw = match(/\{(.*?)\}/g, s);
  const tokens = map((str) => `${str.substr(1, str.length - 2)}`, tokensRaw);
  return tokens;
};

export const flatObject = (obj) => {
  const getEntries = (o, prefix = '') =>
    Object.entries(o).flatMap(([k, v]) =>
      is(Object, v) ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
    );
  return Object.fromEntries(getEntries(obj));
};

export const getTokensArrayFromConfig = (obj) => {
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