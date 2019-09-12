import re
from collections import OrderedDict

VALUE_REGEXP_FORMAT = (
    '(?P<comment>[^\n]*){}[ \t\r\f\v]*=[ \t\r\f\v]*(?P<value>[^\n]+)')


def _get_regexp(key):
    return re.compile(VALUE_REGEXP_FORMAT.format(key))


def _fix_new_line(value):
    if not value.endswith('\n'):
        value = '{}\n'.format(value)

    return value


def set_config_value(config, key, value):
    key_regexp = _get_regexp(key)

    if value is not None:
        value_with_key = '{} = {}'.format(key, value)
    else:
        value_with_key = ''

    new_config, replaced = re.subn(
        key_regexp, value_with_key, config)

    if replaced:
        return _fix_new_line(new_config)

    new_line_end = '' if config.endswith('\n') else '\n'

    return _fix_new_line('{}{}{}'.format(config, new_line_end, value_with_key))


def _get_value(config, key):
    key_regexp = _get_regexp(key)

    match = key_regexp.search(config)

    if match is not None:
        group_dict = match.groupdict()
        if not group_dict['comment'].strip().startswith('#'):
            return group_dict['value']


def parse_configuration(data):
    result = OrderedDict([('includes', [])])

    for line in data.split('\n'):
        line = line.strip()
        if line and not line.startswith('#'):
            key, value = line.split('=', 1)

            key, value = key.strip(), value.strip()

            if key == 'lxc.include':
                result['includes'].append(value)
            else:
                result[key] = value

    return result
