from django.urls import reverse
from django.views.generic import RedirectView


class IndexView(RedirectView):
    def get_redirect_url(self):
        return reverse('compute:containers:list')
