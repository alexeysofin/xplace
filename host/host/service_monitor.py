import queue
import subprocess
import threading

from nameko.dependency_providers import Config
from nameko.events import EventDispatcher

from host.containers import lxc
from host.containers.lxc.const import ContainerState
from host.containers.lxc.monitor import STATE_REGEXP
from host.entrypoints.background import background


class LXCStateMonitorService:
    name = 'lxc-state-monitor'

    dispatch = EventDispatcher()
    config = Config()

    @background()
    def monitor(self, _):
        last_state = ()

        proc = subprocess.Popen('lxc-monitor', stdout=subprocess.PIPE)

        with proc:

            def readline(buffer, __queue):
                for line in iter(buffer, b''):
                    line = line.decode().strip()

                    match = STATE_REGEXP.match(line)

                    if match is not None:
                        result = match.groupdict()
                        __queue.put((result['hostname'], result['state']))

                __queue.put(None)

            _queue = queue.Queue()
            tr = threading.Thread(
                target=readline, args=(proc.stdout.readline, _queue))
            tr.daemon = True
            tr.start()

            # https://stackoverflow.com/questions/40621009/how-to-validate-that-subprocess-popen-is-non-blocking

            while True:
                try:
                    hostname, state = _queue.get()
                except (ValueError, TypeError):
                    break

                if last_state != (hostname, state):
                    last_state = hostname, state

                    container = lxc.container.Container(hostname)

                    if state == ContainerState.RUNNING:
                        private_ipv4 = container.get_internal_ip(timeout=10)
                    else:
                        private_ipv4 = None

                    event = {
                        'state': state,
                        'private_ipv4': private_ipv4,
                        'hostname': hostname
                    }

                    self.dispatch('container_state_changed', event)

                    print(event)