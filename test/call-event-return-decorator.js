import test from 'ava';
import { callEventReturnDecorator } from '../index.js';

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

test('error during event parameter validation', async (t) => {
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
    broker: {
      validator: {
        validate: () => {
          throw new Error('Error in parameter validation');
        },
      },
    },
  });
});

test('simple handler schema', async (t) => {
  const eventSchema = (ctx) => ctx.params;
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
