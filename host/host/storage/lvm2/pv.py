from .utils import run_lvm_command


class PhysicalVolume:
    COMMAND = 'pvs'
    NAMES = ('pv_name', 'pv_free', 'pv_size', 'pv_fmt', 'pv_uuid', 'vg_name')

    BASE_ARGS = ('--unit', 'b', '--noheadings')

    @classmethod
    def instance_from_output_line(cls, line):
        values = [v.strip() for v in line.split()]
        kwargs = dict(zip(cls.NAMES, values))

        return cls(**kwargs)

    @classmethod
    def _run_pvs(cls, pv_name=None):
        # TODO: make a base class with possible names and relations

        pvs_args = [cls.COMMAND, *cls.BASE_ARGS, '-o', ','.join(cls.NAMES)]

        if pv_name is not None:
            pvs_args.append(pv_name)

        return run_lvm_command(*pvs_args)

    @classmethod
    def list(cls):
        output = cls._run_pvs()

        lines = output.split('\n')

        result = []

        for line in lines:
            result.append(cls.instance_from_output_line(line))

        return result

    @classmethod
    def instance_from_pv_name(cls, pv_name):
        output = cls._run_pvs(pv_name=pv_name)
        return cls.instance_from_output_line(output)

    def __init__(self, pv_name, pv_free, pv_size, pv_fmt, pv_uuid, vg_name):
        self.pv_name = pv_name
        self.pv_size = pv_size
        self.pv_free = pv_free
        self.pv_fmt = pv_fmt
        self.pv_uuid = pv_uuid
        self.vg_name = vg_name

    def __str__(self):
        return ('<{} {}, size {}, free {}, '
                'fmt {}>, uuid: {}, vg_name: {}').format(
            self.__class__.__name__,
            self.pv_name, self.pv_size, self.pv_free,
            self.pv_fmt, self.pv_uuid, self.vg_name
        )

    def __repr__(self):
        return self.__str__()
