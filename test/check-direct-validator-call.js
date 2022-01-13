import test from 'ava';
import { ServiceBroker } from 'moleculer';

test('successful validation', (t) => {
  const broker = new ServiceBroker();

  t.snapshot(
    broker.validator.validate(
      {
        param1: 'test',
      },
      {
        param1: { type: 'string' },
      }
    )
  );
});

test('failed validation', (t) => {
  const broker = new ServiceBroker();

  t.snapshot(
    t.throws(() =>
      broker.validator.validate(
        {
          param1: 1,
        },
        {
          param1: { type: 'string' },
        }
      )
    )
  );
});
