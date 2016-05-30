var signal = require('smoke-signal')
var SEPERATOR = ':'

var channels = {}
var pool = []

function close (o) {
  o.close()
}

function createChannel (ws, id, isRoot) {
  if (channels[id]) {
    return channels[id]
  }
  var subChannels = []
  var channel = {
    id: id,
    onConnect: signal(),
    onData: signal(),
    close: function () {
      channel.onConnect.clear()
      channel.onData.clear()
      subChannels.map(close)
      delete channels[id]
    },
    sub: function (suffix) {
      var sub = createChannel(ws, id + SEPERATOR + suffix, /* isRoot=*/ false)
      channel.onConnect.push(sub.onConnect.trigger)
      subChannels.push(sub)
      return sub
    },
    write: function (data, options) {
      options = options || {}
      var connections = pool
      if (options.only) {
        connections = [options.only]
      } else if (options.exclude) {
        connections = pool.filter(connection => options.exclude !== connection)
      }
      connections.map(connection => connection.write(data, channel))
    }
  }
  channels[id] = channel

  function connect (wsConnection) {
    var connection = createConnection(wsConnection, ws)
    pool.push(connection)
    channel.onConnect.trigger(connection)
    wsConnection.on('close', function () {
      connection.close()
      pool.splice(pool.indexOf(connection), 1)
    })
  }

  // only create one connection listener once
  if (isRoot !== false) {
    ws.on('connection', connect)
    var standardClose = channel.close
    channel.close = function () {
      standardClose()
      ws.removeListener('connection', connect)
      pool.map(close)
      pool = []
    }
  }

  return channel
}

function createConnection (wsConnection, ws) {
  var onData = signal()
  var connection = {
    onData: onData,
    write: function (data, channel) {
      wsConnection.write(JSON.stringify({
        channel: channel.id,
        data: data
      }))
    },
    close: onData.clear
  }
  wsConnection.on('data', function (data) {
    var transport = JSON.parse(data)
    var channel = channels[transport.channel]
    if (channel) {
      onData.trigger(transport.data, channel)
      channel.onData.trigger(transport.data, connection)
    } else {
      console.error('want to send data thought "' +
        transport.channel + '". Available channels are \n *' +
        Object.keys(channels).join('\n * '))
    }
  })
  return connection
}

module.exports = createChannel
