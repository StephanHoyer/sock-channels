var _ = require('lodash');
var Signal = require('signals');
var cJSON = JSON; //require('circular-json'); FIXME want to use CircularJSON here, but it does not quite work

var SEPERATOR = ':';

function Channel(ws, id, isRoot) {
  isRoot = isRoot==false ? false : true;
  ws.channels = ws.channels || {};
  if (ws.channels[id]) {
    return ws.channels[id];
  }
  ws.channels[id] = this;

  this.ws = ws;
  this.id = id;
  this.onConnect = new Signal();
  this.onData = new Signal();
  // only create one Connection object per connection
  if (isRoot) {
    this.ws.on('connection', function(conn) {
      conn = new Connection(conn, ws);
      this.onConnect.dispatch(conn);
    }.bind(this));
  }
}

Channel.prototype.removeAll = function() {
  this.onConnect.removeAll();
  this.onData.removeAll();
}

Channel.prototype.sub = function(suffix) {
  var sub = new Channel(this.ws, this.id + SEPERATOR + suffix, /* isRoot=*/ false);
  this.onConnect.add(sub.onConnect.dispatch);
  return sub;
}

Channel.prototype.write = function(conn, data) {
  write(conn, this, data);
}

function Connection(conn, ws) {
  this.ws = ws;
  this.conn = conn;
  this.onData = new Signal();
  this.conn.on('data', function(data) {
    var transport = cJSON.parse(data);
    var channel = this.ws.channels[transport.channel];
    if (channel) {
      this.onData.dispatch(channel, transport.data);
      channel.onData.dispatch(this, transport.data);
    } else {
      console.error('want to send data thought "'
        + transport.channel + '". Available channels are \n *'
        + _.keys(this.ws.channels).join('\n * '));
    }
  }.bind(this));
}

Connection.prototype.write = function(channel, data) {
  write(this, channel, data);
};

Connection.prototype.removeAll = function() {
  this.onData.removeAll();
};

module.exports = Channel;

function write(conn, channel, data) {
  conn.conn.write.call(conn.conn, cJSON.stringify({
    channel: channel.id,
    data: data
  }));
}
