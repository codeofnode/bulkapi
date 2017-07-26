import templist from 'templist';

const isObject = ob => (typeof ob === 'object' && ob !== null && !(Array.isArray(ob)));

const isString = ob => (typeof ob === 'string' && ob.length > 0);

const isNumber = ob => (typeof ob === 'number' && ob !== isNaN && ob > 0);

const notExists = ob => (typeof ob === 'undefined' || ob === null);

const exists = ob => !(notExists(ob));

const stringify = (input, pretty) => {
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    try {
      return pretty
        ? JSON.stringify(input, undefined, isString(pretty) ? pretty : '  ')
        : JSON.stringify(input);
    } catch (err) {
      return String(input);
    }
  }
  return String(input);
};

const getString = function getString(input, ...args) {
  return (typeof input === 'function') ? input(args) : stringify(input);
};

const resolveUrl = function resolveUrl(urlA, urlB) {
  let ua = stringify(urlA);
  let ub = stringify(urlB);
  if (ua.endsWith('/')) ua = ua.slice(0, -1);
  if (!(ub.startsWith('/')) && !(ub.startsWith('http'))) ub = `/${ub}`;
  return ua + ub;
};

const parseObj = function parseObj(obj) {
  if (typeof obj === 'string') {
    try {
      return JSON.parse(obj);
    } catch (erm) {
      return obj;
    }
  }
  return obj;
};

const cloneObj = function cloneObj(obj) {
  return parseObj(stringify(obj));
};

const assign = templist.utils.assign;
const objwalk = templist.utils.objwalk;
const isAlphaNum = templist.utils.isAlphaNum;

export {
  isObject, isString, isNumber, notExists, exists,
  stringify, getString, objwalk, assign, templist,
  resolveUrl, parseObj, cloneObj, isAlphaNum,
};
