from django.contrib import admin

from .models import Image, RamSize, DiskSize, Host, Container, Backup


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    pass


@admin.register(RamSize)
class RamSizeAdmin(admin.ModelAdmin):
    pass


@admin.register(DiskSize)
class DiskSizeAdmin(admin.ModelAdmin):
    pass


@admin.register(Host)
class HostAdmin(admin.ModelAdmin):
    pass


@admin.register(Container)
class ContainerAdmin(admin.ModelAdmin):
    pass


@admin.register(Backup)
class BackupAdmin(admin.ModelAdmin):
    pass

