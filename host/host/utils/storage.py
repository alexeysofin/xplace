import os
import stat


def is_device(path):
    return stat.S_ISBLK(os.stat(path).st_mode)
