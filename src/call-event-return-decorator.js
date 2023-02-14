const handleEvent = async (eventHandler, { validate, eventParamsSchema: eventParametersSchema = {}, eventParams }) => {
  try {
    await validate(eventParams, eventParametersSchema);
    // Without the await, the error will be handled by a global handler
    return await eventHandler();
  } catch (error) {
    return error;
  }
};

export const callEventReturnDecorator = (eventSchema) => {
  const {
    handler: originalHandler,
    params: originalParameters = {},
    ...eventSpec
  } = eventSchema instanceof Function ? { handler: eventSchema } : eventSchema;

  return {
    handler: async (context) => {
      const {
        broker,
        nodeID,
        params,
        params: {
          $$eventReturnHandler: { callbackAction, identifier },
        },
      } = context;
      return context.call(
        callbackAction,
        {
          identifier,
          returnValue: await handleEvent(() => originalHandler(context), {
            validate: broker.validator.validate.bind(broker.validator),
            eventParamsSchema: {
              ...originalParameters,
              $$eventReturnHandler: {
                $$type: 'object',
                identifier: { type: 'uuid' },
                callbackAction: { type: 'string' },
              },
            },
            eventParams: params,
          }),
        },
        {
          // ensure to call back the event emitter node
          nodeID,
        }
      );
    },
    ...eventSpec,
  };
};
