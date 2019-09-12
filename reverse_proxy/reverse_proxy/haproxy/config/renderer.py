
import jinja2

env = jinja2.Environment(
    loader=jinja2.PackageLoader('reverse_proxy.haproxy.config', 'templates'),
)


def render(configuration):
    tpl = env.get_template('haproxy.cfg.j2')
    return tpl.render(configuration=configuration)
