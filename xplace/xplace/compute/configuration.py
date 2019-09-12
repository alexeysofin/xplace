class Key:
    def __init__(self, key):
        self.key = key

    def as_config(self):
        return 'lxc.cgroup.{}'.format(self.key)


class Memory:
    LIMIT_IN_BYTES = Key('memory.limit_in_bytes')
    MEMSW_MAX_USAGE_IN_BYTES = Key(
        'memory.memsw.max_usage_in_bytes')


class CPU:
    CPUSET_CPUS = Key('cpuset.cpus')
    CPU_SHARES = Key('cpu.shares')


def resources_dict(container):
    ram_limit = container.format_ram()

    return {
        Memory.LIMIT_IN_BYTES.as_config(): ram_limit,
        Memory.MEMSW_MAX_USAGE_IN_BYTES.as_config(): ram_limit,
        CPU.CPU_SHARES.as_config(): '1024',
        CPU.CPUSET_CPUS.as_config(): container.cpus
    }
