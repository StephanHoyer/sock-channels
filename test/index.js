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

  before(function(done) {
    server = shoejs(app).listen(3000, function() {
      browser = new Browser();
      browser.visit('http://localhost:3000/', function() {
        window = browser.window;
        done();
      });
    });
  });

  describe('socket connection', function() {
    it('should be there', function() {
      expect(window).to.have.property('ws');
    });
  });

  after(function() {
    server.close();
  });
});
