
class SimidProtocol {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    window.addEventListener('message', this.onMessage_.bind(this), false);
  }

  onMessage_(event) {
    const message = event.data;
    const callback = this.callbacks[message.type];
    if (callback) {
      callback(message);
    }
  }

  sendMessage(message) {
    if (window.parent) {
      window.parent.postMessage(message, '*');
    }
  }

  addListener(messageType, callback) {
    this.callbacks[messageType] = callback;
  }
}
