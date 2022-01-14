import { v4 as uuid } from 'uuid';
import PendingEventHandler from './pending-event-handler.js';

const findEventSubscribers = async (ctx, eventName) => {
  const servicesEvents = await ctx.call('$node.services', { withEvents: true });

  return [
    ...new Set(
      servicesEvents
        // eventName is not a user input but a developer one
        // eslint-disable-next-line security/detect-object-injection
        .filter((service) => service.available && !!service.events[eventName])
        .map((service) => service.name)
    ),
  ];
};

export const callEventMixin = ({ callbackName = '$$event-callback', timeout = 200 } = {}) => {
  const pendingEventHandler = new PendingEventHandler({ timeout });
  return {
    actions: {
      [callbackName]: (ctx) =>
        pendingEventHandler.respond({
          identifier: ctx.params.identifier,
          caller: ctx.caller,
          returnValue: ctx.params.returnValue,
        }),
    },
    methods: {
      $$callEvent: async (ctx, { eventName, payload: originalPayload, opts }) => {
        const identifier = uuid();
        const payload = {
          ...originalPayload,
          $$eventReturnHandler: {
            identifier,
            callbackAction: `${ctx.service.name}.${callbackName}`,
          },
        };
        const eventResponses = pendingEventHandler.getEventResponses({
          identifier,
          eventSubscribers: await findEventSubscribers(ctx, eventName),
        });
        await ctx.emit(eventName, payload, opts);
        return Promise.all(eventResponses);
      },
    },
  };
};
