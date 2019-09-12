import socket
import multiprocessing

from django.core.management.base import BaseCommand
from xplace.compute.models import (
    Host, DiskSize, RamSize, Image, DistributionRelease
)


class Command(BaseCommand):
    help = 'Create test compute data (host, distributions, etc...)'

    def handle(self, *args, **options):
        cpus = multiprocessing.cpu_count()

        Host.objects.create(
            hostname=socket.getfqdn(),
            ram=8192,
            disk_size=200,
            num_cpus=cpus,
            public_ipv4='127.0.0.1',
            lvm_vgname='lxc',
            default_cpus=','.join([str(c) for c in range(cpus)]),
        )

        for val in range(512, 8192+512, 512):
            RamSize.objects.create(
                size_mb=val
            )

        for val in range(10, 100+10, 10):
            DiskSize.objects.create(
                size_gb=val
            )

        ubuntu = Distribution.objects.create(
            name="Ubuntu",
            lxc_template_name="ubuntu"
        )

        DistributionRelease.objects.create(
            distribution=ubuntu,
            name='Ubuntu 14.04',
            version='14.04',
            lxc_release_name='trusty'
        )

        DistributionRelease.objects.create(
            distribution=ubuntu,
            name='Ubuntu 16.04',
            version='16.04',
            lxc_release_name='xenial'
        )

        DistributionRelease.objects.create(
            distribution=ubuntu,
            name='Ubuntu 18.04',
            version='18.04',
            lxc_release_name='bionic'
        )

        centos = Distribution.objects.create(
            name="Centos",
            lxc_template_name="centos"
        )

        DistributionRelease.objects.create(
            distribution=centos,
            name='Centos 6',
            version='6',
            lxc_release_name='6'
        )

        DistributionRelease.objects.create(
            distribution=centos,
            name='Centos 7',
            version='7',
            lxc_release_name='7'
        )

        self.stdout.write(self.style.SUCCESS('Finished creating test data'))
