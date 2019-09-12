class PermissionSerializerMixin:
    permissions = {}

    @property
    def fields(self):
        fields = super().fields

        request = self.context['request']

        for k, perm in self.permissions.items():
            if not perm.has_permission(request, None):
                if k in fields:
                    del fields[k]

        return fields
