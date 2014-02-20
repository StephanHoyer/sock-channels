var _ = require('lodash');
var Signal = require('signals');

var SEPERATOR = ':';

function Channel(ws, prefix) {
  this.ws = ws;
  this.prefix = prefix;
  this.onConnect = new Signal();
  this.ws.on('connection', function(conn) {
    this.onConnect.dispatch(new Connection(conn));
  }.bind(this));
}

Channel.prototype.removeAll = function() {
  this.onConnect.removeAll();
}

Channel.prototype.sub = function(prefix) {
  return new Channel(this.ws, this.prefix + SEPERATOR + prefix, this.ws);
}

function Connection(conn) {
  this.conn = conn;
  this.onData = new Signal();
  this.conn.on('data', function(data) {
    this.onData.dispatch(JSON.parse(data));
  }.bind(this));
}

Connection.prototype.write = function(data) {
  this.conn.write.call(this.conn, JSON.stringify(data));
};

Connection.prototype.removeAll = function() {
  this.onData.removeAll();
};

module.exports.Channel = Channel;
