'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAlphaNum = exports.cloneObj = exports.parseObj = exports.resolveUrl = exports.templist = exports.assign = exports.objwalk = exports.getString = exports.stringify = exports.exists = exports.notExists = exports.isNumber = exports.isString = exports.isObject = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _templist = require('templist');

var _templist2 = _interopRequireDefault(_templist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isObject = function isObject(ob) {
  return (typeof ob === 'undefined' ? 'undefined' : _typeof(ob)) === 'object' && ob !== null && !Array.isArray(ob);
};

var isString = function isString(ob) {
  return typeof ob === 'string' && ob.length > 0;
};

var isNumber = function isNumber(ob) {
  return typeof ob === 'number' && ob !== isNaN && ob > 0;
};

var notExists = function notExists(ob) {
  return typeof ob === 'undefined' || ob === null;
};

var exists = function exists(ob) {
  return !notExists(ob);
};

var stringify = function stringify(input, pretty) {
  if (typeof input === 'string') return input;
  if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object') {
    try {
      return pretty ? JSON.stringify(input, undefined, isString(pretty) ? pretty : '  ') : JSON.stringify(input);
    } catch (err) {
      return String(input);
    }
  }
  return String(input);
};

var getString = function getString(input) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return typeof input === 'function' ? input(args) : stringify(input);
};

var resolveUrl = function resolveUrl(urlA, urlB) {
  var ua = stringify(urlA);
  var ub = stringify(urlB);
  if (ua.endsWith('/')) ua = ua.slice(0, -1);
  if (!ub.startsWith('/') && !ub.startsWith('http')) ub = '/' + ub;
  return ua + ub;
};

var parseObj = function parseObj(obj) {
  if (typeof obj === 'string') {
    try {
      return JSON.parse(obj);
    } catch (erm) {
      return obj;
    }
  }
  return obj;
};

var cloneObj = function cloneObj(obj) {
  return parseObj(stringify(obj));
};

var assign = _templist2.default.utils.assign;
var objwalk = _templist2.default.utils.objwalk;
var isAlphaNum = _templist2.default.utils.isAlphaNum;

exports.isObject = isObject;
exports.isString = isString;
exports.isNumber = isNumber;
exports.notExists = notExists;
exports.exists = exists;
exports.stringify = stringify;
exports.getString = getString;
exports.objwalk = objwalk;
exports.assign = assign;
exports.templist = _templist2.default;
exports.resolveUrl = resolveUrl;
exports.parseObj = parseObj;
exports.cloneObj = cloneObj;
exports.isAlphaNum = isAlphaNum;