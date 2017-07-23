# BulkAPI
Combine multiple APIs into single, call each API, and return a set of responses.

## Why it exists?
> Let's take an example of web service. At startup web service client need to fetch of loads of data from server.
And of course, you server should have a loads of modular component, each of which are responsible to return a part of data.
Now certainly we don't like to make a separate HTTP/Network or similar request to fetch from single component,
of course because we don't like to face `X` times network/handshaking overheads.
What we want is to setup another single endpoint that would be responsible to return a set of data in one go.

`bulkapi` simplifies that single endpoint you need to setup, and let the whole service behave purely on modular components.

It accept the payload in a `certain` format, and divide into set of `x` requests and call each of them to handler.
Once response from each handler is recieved, it combines the result into particular format and return to client.

## Why should you use it.
* Reduce Network Layer Overheads
* The server's endpoints to handle are very robust, modular, and unitified. Now you can focus on units.
* Code Logic of server becomes very simple
* You may generate some request body payload, programmatically (in format of BulkAPI's CoreBody) So you request can become totally dynamic

## Install
```
npm install bulkapi
```

## How to use
### On server side
```javascript
  const BulkAPI = require('bulkapi'), HTTP = require('http');

  const bulkapi = new BulkAPI.default(
    // this is your `custom` handler that will be called for all APIs that you define inside bulkAPI payload
    // this ideally should be server's entry point, but you may tweek as per your need
    function(reqObj, resObj){
      // _setupRequest is restify's server method. Some init stuffs for a request.
      server._setupRequest(reqObj, resObj);
      // _hander is restify's server method. restify routes to a particular handler with this method call.
      server._handle(reqObj, resObj);
    },
  // you may also pass you custom IncomingMessage and/or ServerResponse `class`
  HTTP.IncomingMessage, HTTP.ServerResponse);

  restifyOrExpressServer.post('/bulkapi', bodyParser, bulkapi.callbulk.bind(bulkapi));
```
### On client side
```javascript
// Type CoreBody
/**
 * The CoreBody type definition
 * @typedef {Object} CoreBody
 * @property {object} base - the base object. used to setup some default values in all APIs
 * @property {string} base.url - if exists the base.url will be prefixed to request url, and the final url will be formed
 * @property {object} base.headers - if exists the base.headers will be extended to request headers as default header pairs
 * @property {array} from - the source from which the bulk api should be generated
 *    if the length of result evaluated `from` is `x` then there will be `x` bulk API calls in a request
 *    evaluating and cloning the template `_` x times and pushing as a request.
 * @property {CoreReq[]|CoreReq} _ - the set of bulk requests (if array),
 *    or a template (if object), with `from`
 *    The final result should be a set of requests in type of CoreReq
 */
// Type CoreReq
/**
 * The CoreReq type definition
 * @typedef {Object} CoreReq
 * @property {string} [url] - the url to call, ref to req.url
 * @property {object} [headers] - the key value map of headers, ref to req.headers
 * @property {object|object[]|CoreBody} [body] - the request payload, ref to req.body
 *    (body if your req instance has payload access from key `body`, ie as express or restify or json2server has)
 *    It may further contain any kind of payload.
 *    It can also have nested bulkapi call at any number of levels.
 *    If so it should again have object in form of CoreBody
 *      where url/method is should be used that is used to mount BulkAPI instance
 *      Please note that bodyParser will have no significance to body of nested BulkAPI calls
 * @property {string} [method] - the method ie GET, POST etc, ref to req.method
 *    it is optional, if method not found then its body become the static init values
 *    so that some static values can be used later on for as variable
 *    eg at later stage {{result.{{someIndex}}}} will get the value found `someIndex`ed API from
 *    the list of APIs of bulk payload
 * @property {boolean} [first] - whether we need to obtain result of any request at init, prior
 *    should be used when the result of API need to be evaluated that should be used in upcoming API calls
 */
 ```
#### Example of a simple client request
```javascript
{
  url: 'bulkapi', // main http request end point, that will be handled by BulkAPI.callbulk
  method: 'POST', // main http request method
  // main http request payload, this should be stringified before sending as main request,
  // and should be parsed at server end, in form of object
  body: {
    base: {
      url: this.baseurl, // this will be prefixed to all request url's
    },
    _: [
      {
        url: '/getSomething?rank=1', // CoreReq request url,
        method: 'GET',
      }, {
        url: '/createSomehing', // CoreReq request url,
        method: 'POST',
        body: { // Some sample request payload, remember this need not be parsed, will be automatically available
          name: 'A',
          rank: 1,
        }
      }, {
        // result will be an array of results that is being available from responses.
        // So result.0 refers to first response (of request /getSomething)
        // So result.0.id refers to the FirstResponseObject.id
        url: '/updateSomehing/{{result.0.id}}',
        method: 'PUT',
        body: { // Some sample request payload, remember this need not be parsed
          name: 'A',
          rank: 2,
        },
      },
    ],
  },
}
```

#### A Complex Nested Example
```javascript
{
  url: 'bulkapi', // main http request end point, that will be handled by BulkAPI.callbulk
  method: 'POST', // main http request method
  // main http request payload
  body: [{
    body: SomeStaticArrayOfEndpoints,
  }, {
    // nested request url, that will be handled custom handler passed to BulkAPI instance
    url: `${this.baseurl}bulkapi`,
    method: 'POST',
    body: {
      from: SomeStaticArrayEndpoints,
      base: {
        url: this.baseurl,
      },
      _: { // as `_` is object here, it is the template for SomeStaticArray iterations
        url: 'bulkapi', // deep nested request url, will again be handled custom hander of BulkAPI instance
        method: 'POST',
        body: {
          base: {
            url: this.baseurl,
          },
          _: [{
            url: '{{$data}}', // $data is the current item of SomeStaticArrayEndpoints
            method: 'GET',
            first: true, // we need response this this api call first, before rest of the calls
          }, {
            url: 'bulkapi',
            method: 'POST',
            body: {
              // result of first call, with endpoint {{$data}}, accessing output property of response object
              // assuming the above request send response of object, where output is key having array of some data
              from: '{{result.0.output}}',
              base: {
                // rootResult is the result of main HTTP root request.
                // So here rootResult.0 is the first response of main request
                // means rootResult.0 = SomeStaticArrayEndpoints
                // means rootResult.0.{{$}} = the current endpoint being evaluated (same as {{$data}} used above)
                url: `${this.baseurl}{{rootResult.0.{{$}}}}/`,
              },
              _: { // this is the template for `{{result.0.output}}` array
                // here {{data}} is used of the LATEST `from` evaluation that is from `{{result.0.output}}`
                url: '{{$data}}',
                method: 'GET',
              },
            },
          }],
        },
      },
    },
  }],
}
```

#### Example of a BulkAPI response
> the Response is always an array. Each item in array will be the response of corresponding participating request calls (CoreReq calls). The same rule applies to nested BulkAPI calls too.

### Use of Templist
> You may use the variables in any format, even function calls, as described in [Templist](https://github.com/codeofnode/templist)

## Roadmap
> Raise a feature request by logging an [issue](https://github.com/codeofnode/bulkapi/issues), and that will fill this place

## Any hurdles?
> Found anything difficult to understand? or some bug or some improvement?. Create an issue [issue](https://github.com/codeofnode/bulkapi/issues) for the same.

## License

BulkAPI is released under the MIT license:

http://www.opensource.org/licenses/MIT
