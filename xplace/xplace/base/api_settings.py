from rest_framework.settings import APISettings as OAPISettings


class APISettings(OAPISettings):
    def __init__(self, user_settings=None, defaults=None, import_strings=None):
        super().__init__(user_settings=user_settings, defaults=defaults,
                         import_strings=import_strings)
        self.cached_attrs = set()

    def __getattr__(self, item):
        if item in self.defaults:
            self.cached_attrs.add(item)
        return super(APISettings, self).__getattr__(item)

    def reload(self, user_settings=None):
        for item in self.cached_attrs:
            delattr(self, item)
        self.cached_attrs.clear()

        self._user_settings = user_settings
