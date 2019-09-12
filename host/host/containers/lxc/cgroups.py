class CGroup:
    def __init__(self, key):
        self._key = key

    def as_config(self):
        return 'lxc.cgroup.{}'.format(self._key)

    def strip_config(self):
        return self._key.replace('lxc.cgroup.', '')

    def raw(self):
        return self._key


class CPUAcct:
    USAGE_PER_CPU = CGroup('cpuacct.usage_percpu')


class CPUSet:
    CPUS = CGroup('cpuset.cpus')


class Memory:
    USAGE_IN_BYTES = CGroup('memory.usage_in_bytes')
    LIMIT_IN_BYTES = CGroup('memory.limit_in_bytes')
    SWAP_LIMIT_IN_BYTES = CGroup('memory.memsw.max_usage_in_bytes')
