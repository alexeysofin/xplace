import os

from host.storage.mount import mount_context


def rootfs_mount_path(container):
    mount_path = os.path.join(container.base_path(), 'rootfs')

    if not os.path.exists(mount_path):
        os.makedirs(mount_path, 0o751)

    return mount_path


class rootfs_mount_context(mount_context):
    def __init__(self, container):
        self.container = container
        fs = container.root_fs()

        super().__init__(fs.path, rootfs_mount_path(container))
