var _ = require('lodash');
var Signal = require('signals');

var SEPERATOR = ':';

function Channel(ws, id) {
  this.ws = ws;
  this.id = id;
  this.onConnect = new Signal();
  this.ws.on('connection', function(conn) {
    this.onConnect.dispatch(new Connection(conn, this));
  }.bind(this));
}

Channel.prototype.removeAll = function() {
  this.onConnect.removeAll();
}

Channel.prototype.sub = function(suffix) {
  return new Channel(this.ws, this.id + SEPERATOR + suffix, this.ws);
}

function Connection(conn, channel) {
  this.channel = channel;
  this.conn = conn;
  this.onData = new Signal();
  this.conn.on('data', function(data) {
    var transport = JSON.parse(data);
    if (transport.channel = channel.id) {
      this.onData.dispatch(transport.data);
    }
  }.bind(this));
}

Connection.prototype.write = function(channel, data) {
  this.conn.write.call(this.conn, JSON.stringify({
    channel: channel.id,
    data: data
  }));
};

Connection.prototype.removeAll = function() {
  this.onData.removeAll();
};

module.exports.Channel = Channel;
