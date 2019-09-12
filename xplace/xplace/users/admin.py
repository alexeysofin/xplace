from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as UserAdminBase
from django.utils.translation import ugettext_lazy as _

from xplace.users import models


@admin.register(models.User)
class UserAdmin(UserAdminBase):
    fieldsets = (
        (None, {'fields': ('password',)}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email',
                                         'is_email_verified')}),
        (_('Resources'), {'fields': ('available_ram', 'available_disk_size')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('first_name', 'last_name', 'email')
    ordering = ('email',)


admin.site.register(models.SshKey)


class OrganizationUserInlineAdmin(admin.TabularInline):
    model = models.OrganizationUser
    extra = 0


@admin.register(models.Organization)
class OrganizationAdmin(admin.ModelAdmin):
    inlines = [OrganizationUserInlineAdmin]

