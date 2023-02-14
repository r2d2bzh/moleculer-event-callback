import test from 'ava';
import { callEventReturnDecorator } from '../index.js';

test('event parameter validation', async (t) => {
  const eventSchema = {
    params: {
      param1: { type: 'string' },
    },
    handler: (context) => {
      return context.params;
    },
  };
  await callEventReturnDecorator(eventSchema).handler({
    call: (...arguments_) => t.snapshot(arguments_),
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
    handler: (context) => {
      return context.params;
    },
  };
  await callEventReturnDecorator(eventSchema).handler({
    call: (...arguments_) => t.snapshot(arguments_),
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
  await callEventReturnDecorator((context) => context.params).handler({
    call: (...arguments_) => t.snapshot(arguments_),
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
