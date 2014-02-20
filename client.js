var ws = new SockJS('/ws', null, {debug: true});
(function() {

  var Signal = signals;
  var SEPERATOR = ':';

  function Channel(ws, prefix) {
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

  Channel.prototype.sub = function(prefix) {
    return new Channel(this.ws, this.prefix + SEPERATOR + prefix);
  }

  window.Channel = Channel;
}());
