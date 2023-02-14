import { v4 as uuid } from 'uuid';
import PendingEventHandler from './pending-event-handler.js';

const findEventSubscribers = async (context, eventName) => {
  const servicesEvents = await context.call('$node.services', { withEvents: true });

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
      [callbackName]: (context) =>
        pendingEventHandler.respond({
          identifier: context.params.identifier,
          caller: context.caller,
          returnValue: context.params.returnValue,
        }),
    },
    methods: {
      $$callEvent: async (context, { eventName, payload: originalPayload, opts }) => {
        const identifier = uuid();
        const payload = {
          ...originalPayload,
          $$eventReturnHandler: {
            identifier,
            callbackAction: `${context.service.name}.${callbackName}`,
          },
        };
        const eventResponses = pendingEventHandler.getEventResponses({
          identifier,
          eventSubscribers: await findEventSubscribers(context, eventName),
        });
        await context.emit(eventName, payload, opts);
        return Promise.all(eventResponses);
      },
    },
  };
};
