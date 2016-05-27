/* global describe, it, beforeEach, before, afterEach, */
'use strict'

var expect = require('expect.js')
var http = require('http')
var sockjsServer = require('sockjs')
var createServerChannel = require('./index')
var spyThen = require('./test/spyThen')

var spyThenOptions = {
  argCheck: function (expected, actual) {
    expect(expected).to.eql(actual)
  }
}

var SockjsClient = require('sockjs-client')
var createClientChannel = require('./client')

describe('sock-channels', function () {
  var socketServer, clientRootChannel, serverRootChannel

  before(function () {
    socketServer = sockjsServer.createServer()
    var httpServer = http.createServer()
    socketServer.installHandlers(httpServer, {prefix: '/ws'})
    httpServer.listen(9999, '0.0.0.0')
  })

  beforeEach(function () {
    serverRootChannel = createServerChannel(socketServer)
  })

  afterEach(function () {
    serverRootChannel.close()
  })

  describe('connection', function () {
    it('should connect', function (done) {
      serverRootChannel.onConnect.once(function (connection) {
        clientRootChannel.close()
        done()
      })
      clientRootChannel = createClientChannel(new SockjsClient('http://localhost:9999/ws'))
    })
  })

  describe('communication', function () {
    var clientRootChannelA, clientRootChannelB, connectionA

    beforeEach(function (done) {
      var checkDone = spyThen(done)
      serverRootChannel.onConnect.once(function (connection) {
        connectionA = connection
        clientRootChannelB = createClientChannel(new SockjsClient('http://localhost:9999/ws'))
        clientRootChannelB.onOpen.once(checkDone())
      })
      clientRootChannelA = createClientChannel(new SockjsClient('http://localhost:9999/ws'))
      clientRootChannelA.onOpen.once(checkDone())
    })

    afterEach(function () {
      clientRootChannelA.close()
      clientRootChannelB.close()
    })

    it('should send client to server', function (done) {
      serverRootChannel.onData.once(function (data, connection) {
        expect(data).to.eql({client: 'server'})
        expect(connection).to.eql(connectionA)
        done()
      })
      clientRootChannelA.write({client: 'server'})
    })

    it('should broadcast from server to client', function (done) {
      var shouldBeCalledWith = spyThen(done, spyThenOptions)
      clientRootChannelA.onData.push(shouldBeCalledWith({server: 'broadcast'}))
      clientRootChannelB.onData.push(shouldBeCalledWith({server: 'broadcast'}))
      serverRootChannel.write({server: 'broadcast'})
    })

    it('should send to specified client', function (done) {
      clientRootChannelA.onData.push(function (data) {
        expect(data).to.eql({foo: 'bar'})
        done()
      })
      clientRootChannelB.onData.push(function () {
        done('should not be callCount')
      })
      serverRootChannel.write(connectionA, {foo: 'bar'})
    })
  })

  describe('channels', function () {
    beforeEach(function (done) {
      clientRootChannel = createClientChannel(new SockjsClient('http://localhost:9999/ws'))
      clientRootChannel.onOpen.once(function () { done() })
    })

    afterEach(function () {
      clientRootChannel.close()
    })

    it('should send client to server through channel', function (done) {
      serverRootChannel.sub('mySubChannel').onData.once(function (data) {
        expect(data).to.eql({client: 'server'})
        done()
      })
      serverRootChannel.onData.once(function () {
        done(new Error('data should be sent through sub channel'))
      })
      clientRootChannel.sub('mySubChannel').write({client: 'server'})
    })

    it('should send server to client through channel', function (done) {
      clientRootChannel.sub('mySubChannel').onData.once(function (data) {
        expect(data).to.eql({client: 'server'})
        done()
      })
      clientRootChannel.onData.once(function () {
        done(new Error('data should be sent through sub channel'))
      })
      serverRootChannel.sub('mySubChannel').write({client: 'server'})
    })
  })

  describe('channel lifetime', function() {
    it.skip('should be tested', function() {})
  })
})
