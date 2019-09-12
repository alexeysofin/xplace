from django.urls import path, include

urlpatterns = [
    path('containers/', include('xplace.compute.containers.urls',
                                namespace='containers')),
    path('hosts/', include('xplace.compute.hosts.urls',
                           namespace='hosts')),
    path('ram-sizes/', include('xplace.compute.ram_sizes.urls',
                               namespace='ram_sizes')),
    path('disk-sizes/', include('xplace.compute.disk_sizes.urls',
                                namespace='disk_sizes')),
    path('images/', include('xplace.compute.images.urls',
                            namespace='images')),
]

app_name = 'compute'
