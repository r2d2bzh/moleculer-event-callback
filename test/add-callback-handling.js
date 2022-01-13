import test from 'ava';
import { addCallbackHandling } from '../src/add-callback-handling.js';

test('nominal case', (t) => {
  const eventSchema = {
    params: {
      param1: { type: 'string' },
    },
    handler: (ctx) => {
      return ctx.params;
    },
  };
  addCallbackHandling(eventSchema).handler({
    ctx: {
      call: (args) => t.snapshot(args),
      params: { param1: 'test' },
    },
  });
});
