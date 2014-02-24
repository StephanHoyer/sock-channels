var _ = require('lodash');
var Signal = require('signals');

var SEPERATOR = ':';

function Channel(ws, id) {
  ws.channels = ws.channels || {};
  if (ws.channels[id]) {
    throw new Error('Channel with ' + id + ' already exists');
  }
  ws.channels[id] = this;

  this.ws = ws;
  this.id = id;
  this.onConnect = new Signal();
  this.onData = new Signal();
  this.ws.on('connection', function(conn) {
    conn = new Connection(conn, ws);
    this.onConnect.dispatch(conn);
  }.bind(this));
}

Channel.prototype.removeAll = function() {
  this.onConnect.removeAll();
}

Channel.prototype.sub = function(suffix) {
  return new Channel(this.ws, this.id + SEPERATOR + suffix, this.ws);
}

Channel.prototype.write = function(conn, data) {
  write(conn, this, data);
}

function Connection(conn, ws) {
  this.ws = ws;
  this.conn = conn;
  this.onData = new Signal();
  this.conn.on('data', function(data) {
    var transport = JSON.parse(data);
    var channel = this.ws.channels[transport.channel];
    this.onData.dispatch(channel, transport.data);
    channel.onData.dispatch(this, transport.data);
  }.bind(this));
}

Connection.prototype.write = function(channel, data) {
  write(this, channel, data);
};

Connection.prototype.removeAll = function() {
  this.onData.removeAll();
};

module.exports.Channel = Channel;

function write(conn, channel, data) {
  conn.conn.write.call(conn.conn, JSON.stringify({
    channel: channel.id,
    data: data
  }));
}
