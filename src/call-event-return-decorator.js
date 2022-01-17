const handleEvent = async (eventHandler, { validate, eventParamsSchema = {}, eventParams }) => {
  try {
    await validate(eventParams, eventParamsSchema);
    // Without the await, the error will be handled by a global handler
    return await eventHandler();
  } catch (error) {
    return error;
  }
};

export const callEventReturnDecorator = (eventSchema) => {
  const {
    handler: originalHandler,
    params: originalParams = {},
    ...eventSpec
  } = eventSchema instanceof Function ? { handler: eventSchema } : eventSchema;

  return {
    handler: async (ctx) => {
      const {
        params: {
          $$eventReturnHandler: { callbackAction, identifier },
        },
      } = ctx;
      return ctx.call(
        callbackAction,
        {
          identifier,
          returnValue: await handleEvent(() => originalHandler(ctx), {
            validate: ctx.broker.validator.validate.bind(ctx.broker.validator),
            eventParamsSchema: {
              ...originalParams,
              $$eventReturnHandler: {
                $$type: 'object',
                identifier: { type: 'uuid' },
                callbackAction: { type: 'string' },
              },
            },
            eventParams: ctx.params,
          }),
        },
        {
          // ensure to call back the event emitter node
          nodeID: ctx.nodeID,
        }
      );
    },
    ...eventSpec,
  };
};
