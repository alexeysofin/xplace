import os

from reverse_proxy.utils import run_command
from .config import Configuration, UseBackend


class HAProxy:
    def __init__(self, config_path='/etc/haproxy/haproxy.cfg'):
        self.config_path = config_path
        self._config = None

    def read_config(self):
        self._config = Configuration.from_filename(self.config_path)

    @property
    def config(self) -> Configuration:
        return self._config

    def add_backend(self, name, options):
        return self.config.create_or_update_backend(name, options)

    def update_backend(self, name, options):
        return self.config.create_or_update_backend(name, options)

    def delete_backend(self, name):
        self.config.delete_backend(name)

    def save(self, filename=None):
        self.config.save(filename=filename)

    def get_frontend(self, name):
        for frontend in self.config.frontends:
            if frontend.name == name:
                return frontend

    def reload(self):
        base_name = os.path.basename(self.config_path)
        if base_name != 'haproxy.test.cfg':
            run_command('service', 'haproxy', 'reload')
