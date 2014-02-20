var Signal = signals;
var rootChannel;
var Channel;
(function() {
  function Channel(prefix, ws) {
    this.ws = ws;
    this.prefix = prefix;
    this.onData = new Signal();
    this.onOpen = new Signal();
    this.ws.addEventListener('open', this.onOpen.dispatch);
    this.ws.addEventListener('message', function(message) {
      this.onData.dispatch(JSON.parse(message.data));
    }.bind(this));
  }

  Channel.prototype.removeAll = function() {
    this.onData.removeAll();
  }

  Channel.prototype.write = function(data) {
    this.ws.send(JSON.stringify(data));
  }

  var ws = new SockJS('/ws', null, {debug: true});
  rootChannel = new Channel('root', ws);
  Channel = Channel;
}());
