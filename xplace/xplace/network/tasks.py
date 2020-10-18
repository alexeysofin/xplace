import dramatiq

from django.conf import settings

from nameko.standalone.rpc import ClusterRpcProxy

from xplace.network import models


def get_reverse_proxy_rpc_name(domain):
    return 'network.reverse_proxy.{}'.format(domain.reverse_proxy.hostname)


@dramatiq.actor
def create_backends(domain_id):
    domain = models.Domain.objects.get(id=domain_id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        rv_rpc = cluster_rpc[get_reverse_proxy_rpc_name(domain)]

        response = rv_rpc.create_backend(**{
            "domain": domain.name,
            "destination_http_port": domain.destination_http_port,
            "destination_https_port": domain.destination_https_port,
            "include_sub_domains": domain.include_sub_domains,
            "destination_ip": domain.destination_ip
        })

    domain.change_state(models.DomainState.ACTIVE,
                        backend_id=response.get('backend_id'),
                        event_id=None)

    return {
        'domain_id': domain_id,
        'task': 'CREATE_DOMAIN'
    }


@dramatiq.actor
def update_backends(domain_id):
    domain = models.Domain.objects.get(id=domain_id)

    if domain.backend_id is not None:
        with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
            rv_rpc = cluster_rpc[get_reverse_proxy_rpc_name(domain)]

            rv_rpc.update_backend(**{
                "backend_id": domain.backend_id,
                "domain": domain.name,
                "destination_http_port": domain.destination_http_port,
                "destination_https_port": domain.destination_https_port,
                "include_sub_domains": domain.include_sub_domains,
                "destination_ip": domain.destination_ip
            })

    domain.change_state(models.DomainState.ACTIVE, event_id=None)

    return {
        'domain_id': domain_id,
        'task': 'UPDATE_DOMAIN'
    }


@dramatiq.actor
def delete_backends(domain_id):
    domain = models.Domain.objects.get(id=domain_id)

    if domain.backend_id is not None:
        with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
            rv_rpc = cluster_rpc[get_reverse_proxy_rpc_name(domain)]

            rv_rpc.delete_backend(**{
                "backend_id": domain.backend_id,
            })

    domain.delete()

    return {
        'domain_id': domain_id,
        'task': 'DELETE_DOMAIN'
    }
