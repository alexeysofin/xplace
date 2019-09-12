import re
import subprocess
import threading
import queue


STATE_REGEXP = re.compile(
    '^\'(?P<hostname>.+)\' changed state to \[(?P<state>STOPPED|RUNNING)\]$')


def monitor():
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

        while True:
            state = _queue.get()

            if not state:
                break

            print(state)

            # yield (state['hostname'], state['state'])

            # print(state)

        # for line in iter(proc.stdout.readline, b''):
        #     line = line.decode().strip()
        #
        #     match = STATE_REGEXP.match(line)
        #
        #     if match is not None:
        #         result = match.groupdict()
        #         yield (result['hostname'], result['state'])
