import socket
import uuid

from nameko.dependency_providers import Config
from nameko.rpc import rpc

from reverse_proxy import tasks


class ReverseProxyService:
    name = 'network.reverse_proxy.{}'.format(socket.getfqdn())

    config = Config()

    @rpc
    def create_backend(self,
                       domain,
                       include_sub_domains,
                       destination_http_port,
                       destination_https_port,
                       destination_ip):
        domain = domain.encode('idna').decode('ascii')

        backend_id = uuid.uuid4().hex

        tasks.create_backends(
            domain,
            backend_id,
            include_sub_domains,
            destination_http_port,
            destination_https_port,
            destination_ip,
            self.config
        )

        return {
            'backend_id': backend_id
        }

    @rpc
    def update_backend(self,
                       backend_id,
                       domain,
                       include_sub_domains,
                       destination_http_port,
                       destination_https_port,
                       destination_ip):

        domain = domain.encode('idna').decode('ascii')

        tasks.create_backends(
            domain,
            backend_id,
            include_sub_domains,
            destination_http_port,
            destination_https_port,
            destination_ip,
            self.config
        )

        return True

    @rpc
    def delete_backend(self, backend_id):
        tasks.delete_backends(
            str(backend_id),
            self.config
        )
        return True
