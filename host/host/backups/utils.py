import os


def get_backup_path(filename, config):
    base_path = config['BACKUP_PATH']
    return os.path.join(base_path, filename)
