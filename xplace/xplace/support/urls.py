from django.urls import path, include

urlpatterns = [
    path('tickets/', include('xplace.support.tickets.urls',
                             namespace='tickets')),
]

app_name = 'support'
