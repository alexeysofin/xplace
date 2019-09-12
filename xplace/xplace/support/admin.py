from django.contrib import admin

from xplace.support import models


@admin.register(models.Ticket)
class TicketAdmin(admin.ModelAdmin):
    pass


@admin.register(models.TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    pass
