from django import forms


class RequestFormMixin:
    def __init__(self, request, *args, **kwargs):
        self.request = request
        super().__init__(*args, **kwargs)


class ExtendedFormMixin:
    permissions = {}

    def __init__(self, request, *args, **kwargs):
        self.request = request
        super().__init__(*args, **kwargs)

        for field_name, permission in self.permissions.items():
            if not permission(self.request):
                del self.fields[field_name]


class BaseFilterForm(forms.Form):
    def filter_queryset(self, queryset, request):
        return queryset

