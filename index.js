var _ = require('lodash');
var Signal = require('signals');

var toJSON = JSON.stringify;
var fromJSON = JSON.parse;

function mount(ws) {
  return new Channel(ws, 'root');
}

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

function Connection(conn) {
  this.conn = conn;
  this.onData = new Signal();
  this.conn.on('data', this.onData.dispatch);
}

Connection.prototype.write = function(data) {
  this.conn.write.call(this.conn, JSON.stringify(data));
};

Connection.prototype.removeAll = function() {
  this.onData.removeAll();
};
module.exports.mount = mount;
