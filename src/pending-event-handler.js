import EventEmitter from 'node:events';
import pTimeout from 'p-timeout';

export default class PendingEventHandler extends EventEmitter {
  constructor({ timeout }) {
    super();
    this.timeout = timeout;
  }

  getEventResponses({ identifier, eventSubscribers }) {
    return eventSubscribers.map((eventSubscriber) =>
      pTimeout(new Promise((resolve) => this.once(`${identifier}.${eventSubscriber}`, resolve)), {
        milliseconds: this.timeout,
      })
    );
  }

  respond({ identifier, caller, returnValue }) {
    this.emit(`${identifier}.${caller}`, returnValue);
  }
}
