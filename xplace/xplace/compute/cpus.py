def parse_single_value(value):
    split = value.split('-')
    if len(split) > 1:
        start = int(split[0])
        end = int(split[-1])
        if start >= end:
            raise ValueError("Invalid range")
        return set(range(start, end+1))

    return {int(value)}


def cpus_set(value):
    s = set()
    values = value.split(',')
    for v in values:
        s |= parse_single_value(v)
    return s


def num_cpus(value):
    return len(cpus_set(value))
