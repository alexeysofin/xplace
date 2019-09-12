import typing

from django.http import JsonResponse
from xplace.base.forms import BaseFilterForm


class JSONResponseMixin:
    """
    A mixin that can be used to render a JSON response.
    """
    def render_to_json_response(self, context, **response_kwargs):
        """
        Returns a JSON response, transforming 'context' to make the payload.
        """
        return JsonResponse(
            self.get_data(context),
            **response_kwargs
        )

    def get_data(self, context):
        """
        Returns an object that will be serialized as JSON by json.dumps().
        """
        # Note: This is *EXTREMELY* naive; in reality, you'll need
        # to do much more complex handling to ensure that arbitrary
        # objects -- such as Django model instances or querysets
        # -- can be serialized as JSON.
        return context


class FilterListViewMixin:
    filter_form_class: \
        typing.Union[typing.Type[BaseFilterForm], None] = None

    def __init__(self):
        self.filter_form = None
        super().__init__()

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(object_list=object_list, **kwargs)
        context['filter_form'] = self.filter_form
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.filter_form is not None and self.filter_form.is_valid():
            queryset = self.filter_form.filter_queryset(queryset, self.request)

        return queryset

    def get(self, request, *args, **kwargs):
        if self.filter_form_class is not None:
            self.filter_form = self.filter_form_class(request.GET)
        return super().get(request, *args, **kwargs)
