import test from 'ava';
import { callEventReturnDecorator } from '../src/call-event-return-decorator.js';

test('event parameter validation', async (t) => {
  const eventSchema = {
    params: {
      param1: { type: 'string' },
    },
    handler: (ctx) => {
      return ctx.params;
    },
  };
  await callEventReturnDecorator(eventSchema).handler({
    call: (...args) => t.snapshot(args),
    params: {
      $$eventReturnHandler: {
        identifier: 'id',
        callbackAction: 'service.callback',
      },
      param1: 'test',
    },
    broker: { validator: { validate: () => true } },
  });
});

test('empty parameters schema', async (t) => {
  const eventSchema = {
    handler: (ctx) => {
      return ctx.params;
    },
  };
  await callEventReturnDecorator(eventSchema).handler({
    call: (...args) => t.snapshot(args),
    params: {
      $$eventReturnHandler: {
        identifier: 'id',
        callbackAction: 'service.callback',
      },
      param1: 'test',
    },
    broker: {
      validator: {
        validate: () => true,
      },
    },
  });
});
