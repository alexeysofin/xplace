import dramatiq


class Actor(dramatiq.Actor):
    def message_with_options(
        self, *, args=None, kwargs=None, message_id=None, **options
    ):
        for name in ["on_failure", "on_success"]:
            callback = options.get(name)
            if isinstance(callback, Actor):
                options[name] = callback.actor_name

            elif not isinstance(callback, (type(None), str)):
                raise TypeError(name + " value must be an Actor")

        return dramatiq.Message(
            message_id=message_id,
            queue_name=self.queue_name,
            actor_name=self.actor_name,
            args=args or (),
            kwargs=kwargs or {},
            options=options,
        )

    def send_with_options(
        self, *, args=None, kwargs=None, delay=None, message_id=None, **options
    ):
        message = self.message_with_options(
            args=args, kwargs=kwargs, message_id=message_id, **options
        )
        return self.broker.enqueue(message, delay=delay)