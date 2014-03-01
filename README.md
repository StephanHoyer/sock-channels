[![Build Status](https://travis-ci.org/model-io/sock-channels.png?branch=master)](https://travis-ci.org/model-io/sock-channels)
[![Dependency Status](https://david-dm.org/model-io/sock-channels.png)](https://david-dm.org/model-io/sock-channels)

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

Beside sock.js and the sock-channels client (`client.js`) sock-channels uses
[signals.js](http://millermedeiros.github.com/js-signals/) for it's event
handling, so it is required to also include this on client side.

    var clientCh = new Channel(ws, 'root');

On the server side simply do

    var Channel = require('sock-channels');

    var serverCh = new Channel(ws, 'root');
    serverCh.onConnect.add(function(conn) {
      // use connection
    });

In both cases, there has to be an active Sock.js connection on the `ws`
variable. As you can see, the channels are identified by a key, in this case the
channel is named *root*. You can choose any string you want. Try not to use a
colon, this may produce bugs, because channels use the colon as delimeter for
sub-channel-ids.

Once you have a channel, you can start transporting data throught it.

    //client -> server
    clientCh.write({my: 'things', are: [1,2]});

    //server -> client
    serverCh.write(conn, {my: 'things', are: [1,2]});
    // ... or
    conn.write(serverCh, {my: 'things', are: [1,2]});

As you might see, you can use either the connection or the channel to write to
the client. Objects are serialized to JSON using
[CircularJSON](https://github.com/WebReflection/circular-json) (**NOTE**: Circular
references currently lead to stack overflow, we are working on this).

Listening on data also is really easy

    //client
    clientCh.onData.add(function(data) {
      data.my == 'things' // true
    });

    //server
    serverCh.onData.add(function(conn, data) {
      data.my == 'things' // true
    }
    // ... or
    conn.onData.add(function(channel, data) {
      channel.id == 'root' // true
      data.my == 'things' // true
    }

Note that you there are also two possibilities to listen on data on server side,
one is channel centric the other connection related. You always get the other
object as parameter in the callback function.

This hopefully offers great flexibility in using this module.

Channel multiplexing
--------------------

It's the same on client and on server side:

    var fooCh = existingChannel.sub('foo');
    var barCh = fooCh.sub('bar');

This can be done to any depth you want. Internaly sock-channels store the
channels by concatenating the channel id's together:

    fooCh.id == 'root:foo'; //true
    barCh.id == 'root:foo:bar'; //true

All messages are marked according the channel id, but you don't have to care
about this.

Tests
-----

We have them! They are done throught [zombie.js](http://zombie.labnotes.org/),
which is pretty awesome.

    > npm install
    > npm test

Contributing
------------

Just Do it!

License
-------

(The MIT License)

Copyright (c) 2014 Stephan Hoyer <ste.hoyer@gmail.com>

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
