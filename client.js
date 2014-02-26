(function(cJSON) {

  var Signal = signals;
  var SEPERATOR = ':';

  function Channel(ws, id) {
    this.ws = ws;
    this.id = id;
    this.onData = new Signal();
    this.onOpen = new Signal();
    this.ws.addEventListener('open', this.onOpen.dispatch);
    this.ws.addEventListener('message', function(message) {
      var transport = cJSON.parse(message.data);
      if (transport.channel == this.id) {
        this.onData.dispatch(transport.data);
      }
    }.bind(this));
  }

  Channel.prototype.removeAll = function() {
    this.onData.removeAll();
  }

  Channel.prototype.write = function(data) {
    this.ws.send(cJSON.stringify({
      channel: this.id,
      data: data
    }));
  }

  Channel.prototype.sub = function(suffix) {
    return new Channel(this.ws, this.id + SEPERATOR + suffix);
  }

  window.Channel = Channel;
}(JSON /* FIXME want to use CircularJSON here, but it does not quite work */));
