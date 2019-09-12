import re

from filelock import FileLock

from .haproxy.config import UseBackend
from .haproxy import HAProxy
from . import const
from . import utils


def get_domain_regexp(domain):
    return "^({domain_name}(:[0-9])?|.+\.{domain_name}(:[0-9]+)?)$".format(
        domain_name=re.escape(domain)
    )


def create_backends(name,
                    backend_id,
                    include_sub_domains,
                    http_port,
                    https_port,
                    ip_address,
                    config):
    lock = FileLock(const.LOCK_PATH, timeout=const.LOCK_TIMEOUT)

    ssl_backend_id = utils.get_ssl_backend_id(backend_id)

    with lock:
        ha = HAProxy(
            config_path=config['HAPROXY_CONFIG_PATH'])
        ha.read_config()

        http_backend = ha.add_backend(
            backend_id,
            [
                dict(name='balance', value='roundrobin'),
                dict(name='server', value='s1 {}:{}'.format(
                    ip_address, http_port))
            ]
        )
        https_backend = ha.add_backend(
            ssl_backend_id,
            [
                dict(name='mode', value='tcp'),
                dict(name='balance', value='roundrobin'),
                dict(name='server', value='s1 {}:{}'.format(
                    ip_address, https_port))
            ]
        )

        if include_sub_domains:
            domain_name = get_domain_regexp(name)
            http_use_backend_val = 'if {{ req.hdr(host) -m reg -i {} }}'.format(
                domain_name,
            )
            https_use_backend_val = 'if {{ req_ssl_sni -m reg -i {} }}'.format(
                domain_name,
            )
        else:
            http_use_backend_val = 'if {{ req.hdr(host) -i {} }}'.format(
                name,
            )
            https_use_backend_val = 'if {{ req_ssl_sni -i {} }}'.format(
                name,
            )

        http_frontend = ha.get_frontend('http')
        http_frontend.add_use_backend(
            UseBackend(http_backend.name, http_use_backend_val)
        )

        https_frontend = ha.get_frontend('https')
        https_frontend.add_use_backend(
            UseBackend(https_backend.name, https_use_backend_val)
        )

        for frontend in ha.config.frontends:
            # TODO: non-asterisk domains must precede asterisk ones
            frontend.use_backend = frontend.sort_use_backends()

        ha.save()

        ha.reload()


def delete_backends(backend_id, config):
    lock = FileLock(const.LOCK_PATH, timeout=const.LOCK_TIMEOUT)

    ssl_backend_id = utils.get_ssl_backend_id(backend_id)

    with lock:
        ha = HAProxy(
            config_path=config['HAPROXY_CONFIG_PATH'])
        ha.read_config()

        ha.delete_backend(backend_id)
        ha.delete_backend(ssl_backend_id)

        ha.save()

        ha.reload()

