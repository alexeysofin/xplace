from host.exceptions import ProcessException


class ContainerException(ProcessException):
    pass


class ConfigurationError(Exception):
    pass
