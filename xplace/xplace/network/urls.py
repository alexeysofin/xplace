from django.urls import path, include

urlpatterns = [
    path('domains/', include('xplace.network.domains.urls',
                             namespace='domains')),
    path('reverse-proxies/', include('xplace.network.reverse_proxies.urls',
                                     namespace='reverse_proxies')),
]

app_name = 'network'
