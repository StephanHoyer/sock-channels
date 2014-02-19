var _ = require('lodash');
var Browser = require('zombie');
var expect = require('expect.js');
var Signal = require('signals');
var sockjs = require('sockjs');
var http = require('http');

var app = require('./server/app');
var ws = sockjs.createServer();
var shoejs = require('../');

describe('visit', function() {
  var browser, clientCh, window, conn, serverCh, server, connect, thing, ClientChannel;
  var ServerChannel = shoejs.Channel;

  before(function(done) {
    connect = function connect(done) {
      browser = new Browser();
      browser.visit('http://localhost:3000/', function() {
        window = browser.window;
        clientCh = window.rootChannel;
        ClientChannel = window.Channel;
        done();
      });
    }
    server = http.Server(app);
    ws.installHandlers(server, {prefix:'/ws'});
    serverCh = shoejs.mount(ws);
    server.listen(3000, done);
  });

  describe('socket connection', function() {
    it('should be there', function() {
      expect(window).to.have.property('ws');
    });
  });

  describe('multiplexing', function() {
    it('should be possible server side', function(done) {
      var Channel = ServerChannel;
      expect(serverCh).to.have.property('channel');
      expect(window.ws).to.have.property('channel');
      expect(serverCh).to.be.a(Channel);
      var fooCh = serverCh.sub('foo');
      var barCh = serverCh.sub('bar');
      var foobazCh = subfoo.sub('baz');
      expect(fooCh).to.be.a(Channel);
      expect(barCh).to.be.a(Channel);
      expect(foobazCh).to.be.a(Channel);
    });
    it('should be possible client side', function(done) {
      var Channel = ClientChannel;
      expect(clientCh).to.have.property('channel');
      expect(clientCh).to.be.a(Channel);
      var fooCh = clientCh.sub('foo');
      var barCh = clientCh.sub('bar');
      var foobazCh = subfoo.sub('baz');
      expect(fooCh).to.be.a(Channel);
      expect(barCh).to.be.a(Channel);
      expect(foobazCh).to.be.a(Channel);
    });
  });

  describe('writing to channels', function() {
    it('should be possible from server to client', function(done) {
      serverCh.onConnect(function(conn) {
        conn.write('foo');
      });
      clientCh.onData(function(data) {
        expect(data).to.be('foo');
        done();
      });
    });
    it('should be possible from client to server', function(done) {
      serverCh.onConnect(function(conn) {
        conn.onData(function(data) {
          expect(data).to.be('foo');
          done()
        });
      });
      clientCh.write('foo');
    });
  });

  describe('writing Objects to channels', function() {

    beforeEach(function(done) {
      serverCh.onConnect.add(function connect(c) {
        conn = c;
      });
      connect(done);
    });

    it.only('should be possible from server to client', function(done) {
      thing = {bar: 'foo', baz: [123, true]};
      clientCh.onData.add(function (data) {
        expect(data).to.eql(thing);
        done();
      });
      conn.write(thing);
    });

    it('should be possible from client to server', function(done) {
      conn.onData(function(data) {
        expect(data).to.be(thing);
        done()
      });
      clientCh.write(thing);
    });

    afterEach(function() {
      serverCh.removeAll();
      clientCh.removeAll();
    });

  });

  after(function() {
    server.close();
  });
});
