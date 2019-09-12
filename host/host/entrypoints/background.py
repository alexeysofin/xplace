from __future__ import absolute_import

import time
from logging import getLogger

import eventlet

from nameko.extensions import Entrypoint


_log = getLogger(__name__)


class Background(Entrypoint):
    gt = None

    def __init__(self):
        self.event = eventlet.Event()
        self.stop_event = eventlet.Event()
        super().__init__()

    def stop(self):
        _log.debug('stopping %s', self)
        self.stop_event.send(True)
        self.gt.wait()

    def start(self):
        _log.debug('starting %s', self)
        self.gt = self.container.spawn_managed_thread(self._run)

    def kill(self):
        _log.debug('killing %s', self)
        self.gt.kill()

    def do(self):
        args = (self.stop_event,)
        kwargs = {}

        self.container.spawn_worker(self, args, kwargs,
                                    handle_result=self.handle_result)

    def handle_result(self, worker_ctx, result, exc_info):
        self.event.send(result, exc_info)
        return result, exc_info

    def _run(self):
        while True:
            self.do()

            try:
                self.event.wait()
            except Exception:
                pass

            self.event.reset()

            time.sleep(2)

            # event.poll does not seem to work here without time.sleep
            if self.stop_event.poll():
                break


background = Background.decorator
