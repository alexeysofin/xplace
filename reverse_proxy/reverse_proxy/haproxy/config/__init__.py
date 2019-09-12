import typing

from .parser import parse
from .renderer import render


class Option:
    def __init__(self, name, value):
        self.name = str(name)
        self.value = str(value)

    def __str__(self):
        return '{}: {}'.format(self.name, self.value)

    def __repr__(self):
        return self.__str__()


class Backend:
    def __init__(self, name, options):
        self.name = str(name)
        self.options = [Option(**opt) for opt in options]

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.__str__()


class UseBackend:
    def __init__(self, backend, value):
        self.value = str(value)
        self.backend = str(backend)

    def __str__(self):
        return self.backend

    def __repr__(self):
        return self.__str__()


class Frontend:
    @classmethod
    def backend_sort_priority(cls, value):
        return '-m reg -i' in value

    def sort_use_backends(self):
        return sorted(
            self.use_backend,
            key=lambda ub: (
                self.backend_sort_priority(ub.value)
            ),
        )

    def __init__(self, name, options, use_backend):
        self.name = str(name)
        self.options = [Option(**opt) for opt in options]
        self.use_backend = [UseBackend(**backend) for backend in use_backend]

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.__str__()

    def add_use_backend(self, use_backend):
        _use_backend = None

        for usb in self.use_backend:
            if usb.backend == use_backend.backend:
                _use_backend = usb
                break

        if _use_backend is None:
            self.use_backend.append(use_backend)
        else:
            _use_backend.backend = use_backend.backend
            _use_backend.value = use_backend.value


class Configuration:
    def __init__(self, global_options=None, defaults=None,
                 frontends=None, backends=None, filename=None):
        self.global_options = global_options or []
        self.defaults = defaults or []
        self.frontends = frontends or []
        self.backends = backends or []
        self.filename = filename

    def save(self, filename=None):
        filename = filename or self.filename

        assert filename is not None, "Filename is not set"

        with open(filename, 'w') as fp:
            fp.write(self.render())

    @classmethod
    def from_filename(cls, filename):
        with open(filename, 'r') as fp:
            data = fp.read()

        parsed = parse(data)

        return cls.from_dict(parsed, filename=filename)

    @classmethod
    def from_dict(cls, data, filename=None):
        global_options = [Option(**item) for item in list(data.get('global') or [])]
        defaults = [Option(**item) for item in list(data.get('defaults') or [])]
        frontends = [Frontend(**item) for item in list(data.get('frontends') or [])]
        backends = [Backend(**item) for item in list(data.get('backends') or [])]
        return cls(global_options=global_options, defaults=defaults,
                   frontends=frontends, backends=backends,
                   filename=filename)

    def render(self):
        return render(self)

    def create_or_update_backend(
            self, name: str, options: typing.List[dict]):
        backend = None

        for backend_ in self.backends:
            if backend_.name == name:
                backend = backend_

        if backend is None:
            backend = Backend(name=name, options=options)
            self.backends.append(backend)
        else:
            backend.options = options

        return backend

    def delete_backend(self, name):
        self.backends = [b for b in self.backends if b.name != name]

        for frontend in self.frontends:
            frontend.use_backend = \
                [b for b in frontend.use_backend if b.backend != name]
