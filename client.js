var Signal = signals;
var rootChannel;
var Channel;
(function() {
  var ws = new SockJS('/ws', null, {debug: true});
  function Channel(prefix) {
    this.prefix = prefix;
    this.onData = new Signal();
    this.onOpen = new Signal();
    var that = this;
    ws.addEventListener('open', this.onOpen.dispatch);
    ws.addEventListener('message', function(message) {
      that.onData.dispatch(JSON.parse(message.data));
    });
  }

  Channel.prototype.removeAll = function() {
    this.onData.removeAll();
  }

  rootChannel = new Channel('root');
  Channel = Channel;
}());
