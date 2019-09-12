from .utils import run_lvm_command

from .pv import PhysicalVolume


class VolumeGroup:
    COMMAND = 'vgs'
    NAMES = ('vg_name', 'vg_free', 'vg_size', 'vg_fmt',
             'vg_uuid', 'pv_count', 'lv_count')

    BASE_ARGS = ('--unit', 'b', '--noheadings')

    @classmethod
    def instance_from_output_line(cls, line):
        values = [v.strip() for v in line.split()]
        kwargs = dict(zip(cls.NAMES, values))

        return cls(**kwargs)

    @classmethod
    def _run_vgs(cls, vg_name=None, names=None):
        # TODO: make a base class with possible names and relations

        # to be able to run with pvs names
        if names is None:
            names = cls.NAMES

        vgs_args = [cls.COMMAND, *cls.BASE_ARGS, '-o', ','.join(names)]

        if vg_name is not None:
            vgs_args.append(vg_name)

        return run_lvm_command(*vgs_args)

    @classmethod
    def list(cls):
        output = cls._run_vgs()

        lines = output.split('\n')

        result = []

        for line in lines:
            result.append(cls.instance_from_output_line(line))

        return result

    @classmethod
    def instance_from_vg_name(cls, vg_name):
        output = cls._run_vgs(vg_name=vg_name)
        return cls.instance_from_output_line(output)

    def __init__(self, vg_name, vg_free, vg_size, vg_fmt,
                 vg_uuid, pv_count, lv_count):
        self.vg_name = vg_name
        self.vg_size = vg_size
        self.vg_free = vg_free
        self.vg_fmt = vg_fmt
        self.vg_uuid = vg_uuid
        self.pv_count = pv_count
        self.lv_count = lv_count

    def __str__(self):
        return (
            '<{} {}, size {}, free {}, '
            'fmt {}, uuid: {}, pv_count: {}, lv_count: {}>').format(
            self.__class__.__name__,
            self.vg_name, self.vg_size, self.vg_free,
            self.vg_fmt, self.vg_uuid, self.pv_count, self.lv_count
        )

    def __repr__(self):
        return self.__str__()

    # TODO: you may run vgs with pv_name or lv_name options
    # (which will list pv fields)
    # separated with new line for each pv in a group

    # TODO: return instances of related lv

    def list_pvs(self):
        output = self._run_vgs(
            vg_name=self.vg_name, names=PhysicalVolume.NAMES)

        lines = output.split('\n')

        result = []

        for line in lines:
            result.append(PhysicalVolume.instance_from_output_line(line))

        return result

    # TODO: add pv
