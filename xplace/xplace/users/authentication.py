from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import (
    TokenAuthentication as TokenAuthenticationBase
)

from .models import AuthToken


class TokenAuthentication(TokenAuthenticationBase):
    model = AuthToken
    keyword = 'Bearer'

    def authenticate(self, request):
        if 'authorization' in request.COOKIES and \
                'HTTP_AUTHORIZATION' not in request.META:
            return self.authenticate_credentials(
                request.COOKIES.get('authorization')
            )
        return super().authenticate(request)

    def authenticate_credentials(self, key):
        model = self.get_model()

        try:
            token = model.objects.get(token=key)
        except model.DoesNotExist:
            pass
        else:
            if token.is_active and token.user.is_active:
                return token.user, token

        return AnonymousUser(), None

