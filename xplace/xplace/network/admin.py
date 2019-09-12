from django.contrib import admin

from .models import ReverseProxy, Domain


@admin.register(ReverseProxy)
class ReverseProxyAdmin(admin.ModelAdmin):
    pass


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    pass

