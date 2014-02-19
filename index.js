var _ = require('lodash');
var Signal = require('signals');

var toJSON = JSON.stringify;
var fromJSON = JSON.parse;

function mount(ws) {
  return new Channel(ws, 'root');
}

function Channel(ws, prefix) {
  var that = this;
  this.ws = ws;
  this.prefix = prefix;
  this.onConnect = new Signal();
  this.ws.on('connection', function(conn) {
    var write = conn.write;
    conn.write = function(data) {
      write.call(conn, JSON.stringify(data));
    }
    that.onConnect.dispatch(conn);
  });
}

Channel.prototype.removeAll = function() {
  this.onConnect.removeAll();
}

module.exports.mount = mount;
