from .utils import run_lvm_command


class LogicalVolume:
    COMMAND = 'lvs'
    NAMES = ('lv_name', 'lv_free', 'lv_size', 'lv_fmt',
             'lv_uuid', 'pv_count', 'lv_count')

    BASE_ARGS = ('--unit', 'b', '--noheadings')

    @classmethod
    def instance_from_output_line(cls, line):
        # TODO: make base class
        values = [v.strip() for v in line.split()]
        kwargs = dict(zip(cls.NAMES, values))

        return cls(**kwargs)

    @classmethod
    def _run_vgs(cls, lv_name=None, names=None):
        # TODO: make a base class with possible names and relations

        # to be able to run with pvs names
        if names is None:
            names = cls.NAMES

        lvs_args = [cls.COMMAND, *cls.BASE_ARGS, '-o', ','.join(names)]

        if lv_name is not None:
            lvs_args.append(lv_name)

        return run_lvm_command(*lvs_args)

    @classmethod
    def list(cls):
        output = cls._run_vgs()

        lines = output.split('\n')

        result = []

        for line in lines:
            result.append(cls.instance_from_output_line(line))

        return result

    @classmethod
    def instance_from_lv_name(cls, lv_name):
        output = cls._run_vgs(lv_name=lv_name)
        return cls.instance_from_output_line(output)

    def __init__(self, lv_name, lv_free, lv_size, lv_fmt,
                 lv_uuid, vg_name):
        self.lv_name = lv_name
        self.lv_size = lv_size
        self.lv_free = lv_free
        self.lv_fmt = lv_fmt
        self.lv_uuid = lv_uuid
        self.vg_name = vg_name

    def __str__(self):
        return (
            '<{} {}, size {}, free {}, '
            'fmt {}, uuid: {}, vg_name: {}>').format(
            self.__class__.__name__,
            self.lv_name, self.lv_size, self.lv_free,
            self.lv_fmt, self.lv_uuid, self.vg_name
        )

    def __repr__(self):
        return self.__str__()
