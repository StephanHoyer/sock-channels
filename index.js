var _ = require('lodash');
var http = require('http');
var sockjs = require('sockjs');
var Signal = require('signals');

var ws = sockjs.createServer();
var toJSON = JSON.stringify;
var fromJSON = JSON.parse;

function shoeServer(app) {
  var server;
  if (app.callback) {
    server = http.Server(app.callback());
  } else {
    server = http.Server(app);
  }
  ws.installHandlers(server, {prefix:'/ws'});
  return server;
}

module.exports = shoeServer;
