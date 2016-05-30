[![Build Status](https://travis-ci.org/StephanHoyer/sock-channels.svg?branch=master)](https://travis-ci.org/StephanHoyer/sock-channels)
[![Dependency Status](https://david-dm.org/StephanHoyer/sock-channels.svg)](https://david-dm.org/StephanHoyer/sock-channels)
[![rethink.js](https://img.shields.io/badge/rethink-js-yellow.svg)](https://github.com/rethinkjs/manifest)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

sock-channels
=============

Allows to create channels on top of socket connection based on
[sock.js](http://sockjs.org).

Installation
------------

    npm install sock-channels

Basic usage
-----------

Usage is really simple. Just create an sock.js connection on client and server
side and create a channel with the same socket connection and the same prefix.

Establish a connection on the client

```javascript
var SockjsClient = require('sockjs-client')
var createClientChannel = require('sock-channels')

clientRootChannel = createClientChannel(new SockjsClient('/ws'))
```

On the server side simply do

```javascript
var http = require('http')
var sockjsServer = require('sockjs')
var createServerChannel = require('sock-channels')

socketServer = sockjsServer.createServer()
var httpServer = http.createServer()
socketServer.installHandlers(httpServer, {prefix: '/ws'})
httpServer.listen(9999, '0.0.0.0')
serverRootChannel = createServerChannel(socketServer)
```

In both cases, there has to be an active Sock.js connection on the `/ws`
route.

You know have one root channel to communitcate through. Objects are serialized to JSON.

```javascript
//client -> server
clientRootChannel.write({my: 'things', are: [1,2]});

//server -> all clients (broadcast)
serverRootChannel.write({my: 'things', are: [1,2]});

//server -> specific client
serverRootChannel.onConnect.push(function (connection) {
  serverRootChannel.write({my: 'things', are: [1,2]}, { only: connection });
  // ... or
  connection.write(serverRootChannel, {my: 'things', are: [1,2]});
})

//server -> all but specific client
serverRootChannel.onConnect.push(function (connection) {
  serverRootChannel.write({my: 'things', are: [1,2]}, { exclude: connection });
})
```

Listening on data also is really easy

```javascript
//client
channel.onData.push(function(data) {
  data.my == 'things' // true
});

//server
channel.onData.push(function(data, connection) {
  data.my == 'things' // true
}
// ... or
channel.onData.push(function(data, channel) {
  data.my == 'things' // true
  channel.id == 'root' // true
}
```

Note that you there are also two possibilities to listen on data on server side,
one is channel centric the other connection related. You always get the other
object as parameter in the callback function.

This hopefully offers great flexibility in using this module.

Channel multiplexing
--------------------

It's the same on client and on server side:

```javascript
var fooCh = existingChannel.sub('foo');
var barCh = fooCh.sub('bar');
```

This can be done to any depth you want. Internaly sock-channels store the
channels by concatenating the channel id's together:

```javascript
fooCh.id == 'root:foo'; //true
barCh.id == 'root:foo:bar'; //true
```

All messages are marked according the channel id, but you don't have to care
about this.

Events
------

Events are done with a minimal event-observer lib called [smoke-signal](https://github.com/StephanHoyer/smoke-signal)

you can attach to events by calling `once` or `push`. Detach with `pause`.

On the client channel there are the following events

* `channel.onOpen`: calles if the connection to the server is established
* `channel.onData`: calles if there is some incomming data, `data` is first argument

On the server channel there are the following events

* `channel.onConnect`: calles if the connection to the client is established, `connection` is first argument
* `channel.onData`: calles if there is some incomming data, `data` is first argument, `connection` is second

On the server connection there are the following events
* `channel.onData`: calles if there is some incomming data, `data` is first * argument, `channel` is second

License
-------

(The MIT License)

Copyright (c) 2016 Stephan Hoyer <ste.hoyer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
