# moleculer-event-callback

As Moleculer events are [fire-and-forget](https://moleculer.services/docs/0.14/events.html#node-disconnected), this project works around this by providing event subscribers a way to send their answers back to the event emitter.

This project is necessary until [Moleculer channels](https://github.com/moleculerjs/moleculer-channels) are production ready.
Contrary to Moleculer events, channels provides a way to send reliable messages.
Here "reliable" means that the message emitter knows how its message was handled by the subscribers.
Two helpers are provided in order to implement this feature:

* On the emitter side, the `callEventMixin` mixin adds a callback action and a `$$callEvent` method to the service.
  `$$callEvent` emits a Moleculer event with an `$$eventReturnHandler` parameter.
  This parameter keeps information about the emitter callback action.

* On the subscriber side, the `callEventReturnDecorator` function decorates a Moleculer event schema specification.
  The decorator ensures that the subscriber's event handler returned value or raised error is sent back through the emitter callback action.

For a code example, see [the following unit test](test/call-event-mixin.js#L32-L57).
