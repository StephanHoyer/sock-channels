var signal = require('smoke-signal')
var SEPERATOR = ':'

function createChannel (ws, id) {
  var onWsData = signal()
  var onOpen = signal()
  ws.addEventListener('open', onOpen.trigger)
  ws.addEventListener('close', onWsData.clear)
  ws.addEventListener('message', function (message) {
    var transport = JSON.parse(message.data)
    onWsData.trigger(transport.channel, transport.data)
  })
  function createSubChannel (id) {
    var onData = signal()
    ws.addEventListener('close', onData.clear)
    onWsData.push(function (channelId, data) {
      if (channelId === id) {
        onData.trigger(data)
      }
    })
    return {
      onData: onData,
      onOpen: onOpen,
      close: onData.clear,
      write: function (data) {
        ws.send(JSON.stringify({
          channel: id,
          data: data
        }))
      },
      sub: function (suffix) {
        return createSubChannel(id + SEPERATOR + suffix)
      }
    }
  }
  return createSubChannel(id)
}

module.exports = createChannel
