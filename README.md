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


## Install
```
npm install bulkapi
```

## How to use
```javascript
  //Coming soon ...
```

## Roadmap
> Raise a feature request by logging an [issue](https://github.com/codeofnode/bulkapi/issues), and that will fill this place

## Any hurdles?
> Found anything difficult to understand? or some bug or some improvement?. Create an issue [issue](https://github.com/codeofnode/bulkapi/issues) for the same.

## License

BulkAPI is released under the MIT license:

http://www.opensource.org/licenses/MIT
