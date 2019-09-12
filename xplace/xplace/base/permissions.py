from rest_framework.permissions import BasePermission


def is_superuser(request):
    return request.user.is_superuser


class IsSuperUser(BasePermission):
    """
    Allows access only to super users.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class IsSuperUserOrReadyOnly(BasePermission):
    """
    Allows access only to super users or ready only access for others.
    """

    SAFE_METHODS = ['GET']

    def has_permission(self, request, view):
        if request.method in self.SAFE_METHODS:
            return True

        return bool(request.user and request.user.is_superuser)
