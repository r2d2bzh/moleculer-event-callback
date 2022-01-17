import test from 'ava';
import { callEventReturnDecorator, callEventMixin } from '../index.js';
import { ServiceBroker } from 'moleculer';

const runBroker = async (broker, ...services) => {
  services.forEach((service) => broker.createService(service));
  await broker.start();

  return broker.waitForServices(services.map(({ name }) => name));
};

const waitForEventDiscovery = async (broker, eventName) => {
  while (!(await broker.call('$node.events')).filter((event) => event.name === eventName).length) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

const cleanEventResponse = ({ $$eventReturnHandler: { identifier, ...eventReturnHandler }, ...eventResponse }) => ({
  $$eventReturnHandler: {
    identifier: identifier.length,
    ...eventReturnHandler,
  },
  ...eventResponse,
});

test('event handler nominal case', async (t) => {
  const emitterBroker = new ServiceBroker({
    nodeID: 'emitter',
    transporter: 'TCP',
    logLevel: { '**': 'none' },
  });
  await runBroker(emitterBroker, {
    name: 'emitter',
    mixins: [callEventMixin()],
    actions: {
      'emit-event-with-callback': function (ctx) {
        return this.$$callEvent(ctx, { eventName: 'event', payload: ctx.params });
      },
    },
  });

  await runBroker(
    new ServiceBroker({
      nodeID: 'receiver',
      transporter: 'TCP',
      logLevel: { '**': 'none' },
    }),
    {
      name: 'receiver',
      events: {
        event: callEventReturnDecorator({
          handler: (ctx) => {
            return `event called with params: ${JSON.stringify(cleanEventResponse(ctx.params))}`;
          },
        }),
      },
    }
  );

  await waitForEventDiscovery(emitterBroker, 'event');
  t.snapshot(await emitterBroker.call('emitter.emit-event-with-callback', { param1: 'value1' }));
});
