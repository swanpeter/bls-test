
class BaseSimidCreative {
  constructor() {
    this.protocol = new SimidProtocol({
      'startCreative': this.startCreative.bind(this),
      'stopCreative': this.stopCreative.bind(this),
    });
  }

  ready() {
    this.protocol.sendMessage({
      type: 'creativeReady'
    });
  }

  startCreative(message) {
    this.protocol.sendMessage({
      type: 'creativeStarted'
    });
  }

  stopCreative(message) {
    this.protocol.sendMessage({
      type: 'creativeStopped'
    });
  }
}
