var _ = require('lodash');
var Browser = require('zombie');
var expect = require('expect.js');
var Signal = require('signals');

var app = require('./server/app');
var shoejs = require('../');

describe('visit', function() {
  var browser;
  var window;
  var server;
  var serverCh;
  var clientCh;
  var ClientChannel;
  var ServerChannel = shoejs.Channel;


  before(function(done) {
    server = shoejs(app).listen(3000, function(ch) {
      serverCh = ch;
      browser = new Browser();
      browser.visit('http://localhost:3000/', function() {
        window = browser.window;
        clientCh = window.ws.ch;
        ClientChannel = window.ws.Channel;
        done();
      });
    });
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
    var thing = {bar: 'foo', baz: [123, true]};
    it('should be possible from server to client', function(done) {
      serverCh.onConnect(function(conn) {
        conn.write(thing);
      });
      clientCh.onData(function(data) {
        expect(data).to.eql(thing);
        done();
      });
    });
    it('should be possible from client to server', function(done) {
      serverCh.onConnect(function(conn) {
        conn.onData(function(data) {
          expect(data).to.be(thing);
          done()
        });
      });
      clientCh.write(thing);
    });
  });

  after(function() {
    server.close();
  });
});
