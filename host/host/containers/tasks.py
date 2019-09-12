import os

from host.storage.chroot import chroot_command
from host.containers.lxc.rootfs import rootfs_mount_context
from host.containers import lxc


def reset_container_password(name, username, password):
    container = lxc.container.Container(name)

    with rootfs_mount_context(container) as mount_:
        chroot_command(mount_.directory, 'id {}'.format(username))

        _ = chroot_command(
            mount_.directory, 'passwd {}'.format(username),
            command_input='{0}\n{0}'.format(password).encode()
        )


def add_ssh_keys(container, username, ssh_keys):
    with rootfs_mount_context(container) as mount_:
        info = chroot_command(
            mount_.directory, 'getent passwd "{}"'.format(username)
        )

        username, _, uid, gid, _, home_dir, shell = info.split(':')

        ssh_chrooted_path = os.path.join(
            home_dir, '.ssh'
        )
        ssh_host_path = os.path.join(
            mount_.directory, ssh_chrooted_path.lstrip('/'))

        keys_filename = 'authorized_keys'
        keys_chrooted_path = os.path.join(ssh_chrooted_path, keys_filename)
        keys_host_path = os.path.join(ssh_host_path, keys_filename)

        if not os.path.exists(ssh_host_path):
            chroot_command(
                mount_.directory, 'mkdir -p {}'.format(ssh_chrooted_path),
            )
            chroot_command(
                mount_.directory, 'chmod 700 {}'.format(ssh_chrooted_path),
            )
            chroot_command(
                mount_.directory, 'chown {}:{} {}'.format(
                    username, username, ssh_chrooted_path),
            )

        key_file_existed = os.path.exists(keys_host_path)

        with open(keys_host_path, 'a') as fp:
            for key in ssh_keys:
                fp.write(key + '\n')

        if not key_file_existed:
            chroot_command(
                mount_.directory, 'chmod 644 {}'.format(keys_chrooted_path),
            )
            chroot_command(
                mount_.directory, 'chown {}:{} {}'.format(
                    username, username, keys_chrooted_path),
            )
