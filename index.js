'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MockResMethods = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* global global, Promise */


var _util = require('./util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** @const {function} ifEndForObjWalk - the function to find if no more iteration required */
var ifEndForObjWalk = function ifEndForObjWalk(obj, depth) {
  if (depth > _util.templist.config.maxobjdepth) return false;
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null) {
    if (obj.from && obj._) {
      var toRet = Object.keys(obj).filter(function (ky) {
        return ky !== '_' && ky !== 'from';
      });
      toRet.toEndBulk = true;
      return toRet;
    }
    return obj;
  }
  return false;
};

/** @const {function} WALK - The function to iterate deeper in object */
var WALK = function WALK(fun, rt, obj, key, depth) {
  var dep = depth || 0;
  fun(obj, key, rt, dep || 0);
  var ob = ifEndForObjWalk(obj, dep);
  if (ob) {
    var kys = void 0;
    if (Array.isArray(ob) && ob.toEndBulk === true) {
      kys = ob.filter(function (ky) {
        return ky !== 'toEndBulk';
      });
      ob = obj;
    } else {
      kys = Object.keys(ob);
    }
    var lastln = kys.length;
    var deep = dep + 1;
    for (var z = 0; z <= lastln; z += 1) {
      WALK(fun, ob, ob[kys[z]], kys[z], deep);
    }
  }
};

/** @const {function} CONVERT - the function to get replaced value */
var CONVERT = _util.templist.create(0, Object.assign(_util.templist.utils, { objwalk: WALK }));

/**
 * @module bulkapi
 */

/**
 * An instance of [Promise]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}.
 * @typedef {Promise} Promise
 */

/**
 * A mock request class
 * @class
 */

var MockReq = function MockReq() {
  _classCallCheck(this, MockReq);
};
/**
 * A mock response class
 * @class
 */


var MockRes = function MockRes() {
  _classCallCheck(this, MockRes);
};

/**
 * A mock response methods
 */


var MockResMethods = {
  /**
   * create an instance of mock res
   * @param {function} resolve - call if operation is success
   * @param {function} reject - call if operation is failure
   * @return {Object} this - returns self.
   */
  initPromise: function initPromise(resolve, reject) {
    this.resolve = resolve;
    this.responseText = '';
    this.reject = reject;
    this.finished = false;
    return this;
  },
  /**
   * send the response, and mark finished
   * @param {Object} data - the response payload/object
   */
  over: function over(data) {
    if (!this.finished) {
      this.finished = true;
      var call = 'reject';
      if (!(0, _util.isNumber)(this.statusCode) || this.statusCode > 199 && this.statusCode < 300) {
        call = 'resolve';
      }
      this[call](data === undefined ? this.responseText : data);
    }
  },
  /**
   * sortcut to `over` method
   * @param {Object} data - the response payload/object
   */
  end: function end(data) {
    this.over(data === undefined ? this.responseText : data);
  },
  /**
   * add the data to response buffer
   * @param {string} data - the response payload/object
   */
  write: function write(data) {
    this.responseText += (0, _util.stringify)(data);
  },
  /**
   * set the status code
   * @param {number} num - the status code
   */
  status: function status(num) {
    this.statusCode = num;
    return this;
  },
  /**
   * evaluate if status code is also being sent
   * @param {number|Object} num - the status code or response data
   * @param {Object} data - if num is not a number then it will be repsonse data
   */
  sending: function sending(num, data) {
    if ((0, _util.isNumber)(num)) {
      this.status(num).over(data);
    } else {
      this.over(num);
    }
  },
  /**
   * shortcut to sending
   * @param {number|Object} num - the status code or response data
   * @param {Object} data - if num is not a number then it will be repsonse data
   */
  json: function json(num, data) {
    this.sending(num, data);
  },
  /**
   * shortcut to sending
   * @param {number|Object} num - the status code or response data
   * @param {Object} data - if num is not a number then it will be repsonse data
   */
  send: function send(num, data) {
    this.sending(num, data);
  }
};

var MockResKeys = Object.keys(MockResMethods);

/**
 * A class which has methods to convert single to number of apis
 *  and combine those back into single
 * @class
 */

var BulkAPI = function () {
  /**
   * create an instance of BulkAPI
   * @param {function} handler - the function that will be called upon each of the api calls
   * @param {function} MockReq - the class that will return the request instance
   * @param {function} MockReq - the class that will return the response instance
   * @param {function} succ - the function that will be called
   *          when response of all the api calls will be available
   * @param {function} fail - the function that will be called
   *          when one of the API call fails
   */
  function BulkAPI(handler) {
    var mockReq = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MockReq;
    var mockRes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MockRes;
    var succ = arguments[3];
    var fail = arguments[4];

    _classCallCheck(this, BulkAPI);

    this.handler = handler;
    this.success = typeof succ !== 'function' ? function success(data) {
      this.end((0, _util.stringify)(data));
    } : succ;
    this.failure = typeof fail !== 'function' ? function failure(err) {
      this.statusCode = 409;
      this.end((0, _util.stringify)(err.message || err));
      console.log(err); // eslint-disable-line no-console
    } : fail;
    this.MockReq = mockReq;
    this.MockRes = mockRes;
  }

  /**
   * Divide one bulk API into a number of other apis
   *  That explains how bulk should be intercepted?
   *
   * @param {Object} payload - typically the request payload
   * @static
   */


  _createClass(BulkAPI, [{
    key: 'resolveRequest',


    /*
     * Resolve request object body, expand its body as another bulk api call
     * @param {Object} reqObj - the current request api object
     * @param {Object[]} resultArr - the current result array
     */
    value: function resolveRequest(reqObj, resultArr) {
      var nowOb = { result: resultArr, rootResult: this.rootResult };
      var from = CONVERT(reqObj.body && reqObj.body.from, nowOb);
      if (Array.isArray(from)) {
        Object.assign(reqObj.body, {
          _: from.map(function (dt, ind) {
            return CONVERT((0, _util.cloneObj)(reqObj.body._), Object.assign({
              $data: dt,
              $: ind
            }, nowOb));
          })
        });
      }
      delete reqObj.body.from; // eslint-disable-line no-param-reassign
      CONVERT(reqObj.body, nowOb);
    }

    /*
     * resolve the paylaod
     *  once payload is array (each must have body property),
     * @param {Object} req - the request body for one api
     * @return {Promise} promise - the resolution of all the apis
     */

  }, {
    key: 'promisify',
    value: function promisify(req) {
      var _this = this;

      return new Promise(function (res, rej) {
        var nreq = new _this.MockReq(req);
        Object.assign(nreq, req);
        nreq.rootResult = _this.rootResult;
        var nres = new _this.MockRes(nreq);
        MockResKeys.forEach(function (ky) {
          nres[ky] = MockResMethods[ky].bind(nres);
        });
        nres.initPromise(res, rej);
        _this.handler(nreq, nres);
      });
    }

    /*
     * resolve the paylaod
     * @param {Object} req - the incoming request instance
     * @return {Object[]} res - the resolution of all the apis
     */

  }, {
    key: 'resolve',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req) {
        var res, arr, ln, z, prmarr;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                res = [];

                if (!Array.isArray(this.rootResult)) this.rootResult = res;
                this.resolveRequest(req, res);
                arr = BulkAPI.divide(req.body);
                ln = arr.length;
                z = 0;

              case 6:
                if (!(z < ln)) {
                  _context.next = 16;
                  break;
                }

                if (!arr[z].method) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt('break', 16);

              case 11:
                this.resolveRequest(arr[z], res);
                res.push(arr[z].body);

              case 13:
                z += 1;
                _context.next = 6;
                break;

              case 16:
                if (!(z < ln)) {
                  _context.next = 30;
                  break;
                }

                if (!arr[z].first) {
                  _context.next = 26;
                  break;
                }

                this.resolveRequest(arr[z], res);
                _context.t0 = res;
                _context.next = 22;
                return this.promisify(arr[z]);

              case 22:
                _context.t1 = _context.sent;

                _context.t0.push.call(_context.t0, _context.t1);

                _context.next = 27;
                break;

              case 26:
                return _context.abrupt('break', 30);

              case 27:
                z += 1;
                _context.next = 16;
                break;

              case 30:
                prmarr = [];

                for (; z < ln; z += 1) {
                  this.resolveRequest(arr[z], res);
                  prmarr.push(this.promisify(arr[z]));
                }
                _context.t2 = res.push;
                _context.t3 = res;
                _context.t4 = _toConsumableArray;
                _context.next = 37;
                return Promise.all(prmarr);

              case 37:
                _context.t5 = _context.sent;
                _context.t6 = (0, _context.t4)(_context.t5);

                _context.t2.apply.call(_context.t2, _context.t3, _context.t6);

                return _context.abrupt('return', res);

              case 41:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function resolve(_x3) {
        return _ref.apply(this, arguments);
      }

      return resolve;
    }()

    /*
     * call bulk for express like handlers
     */

  }, {
    key: 'callbulk',
    value: function callbulk(req, res) {
      this.rootResult = req.rootResult;
      this.resolve(req).then(this.success.bind(res)).catch(this.failure.bind(res));
    }
  }], [{
    key: 'divide',
    value: function divide(payload) {
      if ((typeof payload === 'undefined' ? 'undefined' : _typeof(payload)) !== 'object' || payload === null) return [];
      var base = payload.base;
      if (!(0, _util.isObject)(base)) base = {};
      return (Array.isArray(payload._) ? payload._ : payload._ ? [payload._] : Array.isArray(payload) ? payload : [payload]).map(function (ob) {
        return {
          method: ob.method || base.method,
          url: (0, _util.resolveUrl)((0, _util.stringify)((0, _util.exists)(base.url) ? base.url : ''), (0, _util.stringify)((0, _util.exists)(ob.url) ? ob.url : '')),
          headers: Object.assign({}, base.headers, ob.headers),
          body: Object.assign(Array.isArray(ob.body) ? new Array(ob.body.length) : {}, base.body, ob.body),
          first: (0, _util.exists)(ob.first) ? Boolean(ob.first) : Boolean(base.first)
        };
      }).sort(function (oa, ob) {
        var sc = function sc(ab) {
          return (0, _util.notExists)(ab.method) ? 0 : ab.first ? 1 : 2;
        };
        return sc(oa) - sc(ob);
      });
    }
  }]);

  return BulkAPI;
}();

exports.default = BulkAPI;
exports.MockResMethods = MockResMethods;