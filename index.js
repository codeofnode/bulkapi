/* global global, Promise */
import { stringify, exists, notExists, isObject,
  resolveUrl, isNumber, templist, cloneObj } from './util';

/** @const {function} ifEndForObjWalk - the function to find if no more iteration required */
const ifEndForObjWalk = function ifEndForObjWalk(obj, depth) {
  if (depth > templist.config.maxobjdepth) return false;
  if (typeof obj === 'object' && obj !== null) {
    if (obj.from && obj._) {
      const toRet = Object.keys(obj).filter(ky => (ky !== '_' && ky !== 'from'));
      toRet.toEndBulk = true;
      return toRet;
    }
    return obj;
  }
  return false;
};

/** @const {function} WALK - The function to iterate deeper in object */
const WALK = function WALK(fun, rt, obj, key, depth) {
  const dep = depth || 0;
  fun(obj, key, rt, dep || 0);
  let ob = ifEndForObjWalk(obj, dep);
  if (ob) {
    let kys;
    if (Array.isArray(ob) && ob.toEndBulk === true) {
      kys = ob.filter(ky => ky !== 'toEndBulk');
      ob = obj;
    } else {
      kys = Object.keys(ob);
    }
    const lastln = kys.length - 1;
    const deep = dep + 1;
    for (let z = 0; z <= lastln; z += 1) {
      WALK(fun, ob, ob[kys[z]], kys[z], deep, z === lastln);
    }
  }
};

/** @const {function} CONVERT - the function to get replaced value */
const CONVERT = templist.create(0, Object.assign(templist.utils, { objwalk: WALK }));

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
class MockReq {}
/**
 * A mock response class
 * @class
 */
class MockRes {}

/**
 * A mock response methods
 */
const MockResMethods = {
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
    if (!(this.finished)) {
      this.finished = true;
      let call = 'reject';
      if (!(isNumber(this.statusCode)) || (this.statusCode > 199 && this.statusCode < 300)) {
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
    this.responseText += stringify(data);
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
    if (isNumber(num)) {
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
  },
};

const MockResKeys = Object.keys(MockResMethods);

/**
 * A class which has methods to convert single to number of apis
 *  and combine those back into single
 * @class
 */
class BulkAPI {
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
  constructor(handler, mockReq = MockReq, mockRes = MockRes, succ, fail) {
    this.handler = handler;
    this.success = (typeof succ !== 'function') ? function success(data) {
      this.end(stringify(data));
    } : succ;
    this.failure = (typeof fail !== 'function') ? function failure(err) {
      this.statusCode = 409;
      this.end(stringify(err.message || err));
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
  static divide(payload) {
    if (typeof payload !== 'object' || payload === null) return [];
    let base = payload.base;
    if (!(isObject(base))) base = {};
    return (Array.isArray(payload._) ? payload._ : (payload._ ? [payload._] :
      (Array.isArray(payload) ? payload : [payload]))).map(ob => ({
        method: ob.method || base.method,
        url: resolveUrl(stringify(exists(base.url) ? base.url : ''),
                stringify(exists(ob.url) ? ob.url : '')),
        headers: Object.assign({}, base.headers, ob.headers),
        body: Object.assign(Array.isArray(ob.body) ? new Array(ob.body.length) : {},
          base.body, ob.body),
        first: exists(ob.first) ? Boolean(ob.first) : Boolean(base.first),
      })).sort((oa, ob) => {
        const sc = ab => (notExists(ab.method) ? 0 : (ab.first ? 1 : 2));
        return sc(oa) - sc(ob);
      });
  }

  /*
   * Resolve request object body, expand its body as another bulk api call
   * @param {Object} reqObj - the current request api object
   * @param {Object[]} resultArr - the current result array
   */
  resolveRequest(reqObj, resultArr) {
    const nowOb = { result: resultArr, rootResult: this.rootResult };
    const from = CONVERT(reqObj.body && reqObj.body.from, nowOb);
    if (Array.isArray(from)) {
      Object.assign(reqObj.body, {
        _: from.map((dt, ind) => CONVERT(cloneObj(reqObj.body._), Object.assign({
          $data: dt,
          $: ind,
        }, nowOb))),
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
  promisify(req) {
    return new Promise((res, rej) => {
      const nreq = new (this.MockReq)(req);
      Object.assign(nreq, req);
      nreq.rootResult = this.rootResult;
      const nres = new (this.MockRes)(nreq);
      MockResKeys.forEach((ky) => {
        nres[ky] = MockResMethods[ky].bind(nres);
      });
      nres.initPromise(res, rej);
      this.handler(nreq, nres);
    });
  }

  /*
   * resolve the paylaod
   * @param {Object} req - the incoming request instance
   * @return {Object[]} res - the resolution of all the apis
   */
  async resolve(req) {
    const res = [];
    if (!Array.isArray(this.rootResult)) this.rootResult = res;
    this.resolveRequest(req, res);
    const arr = BulkAPI.divide(req.body);
    const ln = arr.length;
    let z = 0;
    for (; z < ln; z += 1) {
      if (arr[z].method) {
        break;
      } else {
        this.resolveRequest(arr[z], res);
        res.push(arr[z].body);
      }
    }
    for (; z < ln; z += 1) {
      if (arr[z].first) {
        this.resolveRequest(arr[z], res);
        res.push(await this.promisify(arr[z])); // eslint-disable-line no-await-in-loop
      } else {
        break;
      }
    }
    const prmarr = [];
    for (; z < ln; z += 1) {
      this.resolveRequest(arr[z], res);
      prmarr.push(this.promisify(arr[z]));
    }
    res.push(...(await Promise.all(prmarr)));
    return res;
  }

  /*
   * call bulk for express like handlers
   */
  callbulk(req, res) {
    this.rootResult = req.rootResult;
    this.resolve(req).then(this.success.bind(res)).catch(this.failure.bind(res));
  }

}

export { BulkAPI as default, MockResMethods };
