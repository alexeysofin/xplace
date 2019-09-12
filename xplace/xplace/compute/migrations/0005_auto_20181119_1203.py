# Generated by Django 2.1.3 on 2018-11-19 12:03

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compute', '0004_auto_20181118_1756'),
    ]

    operations = [
        migrations.AlterField(
            model_name='container',
            name='private_ipv4',
            field=models.CharField(blank=True, max_length=39, null=True, validators=[django.core.validators.validate_ipv46_address]),
        ),
        migrations.AlterField(
            model_name='container',
            name='public_ipv4',
            field=models.CharField(blank=True, max_length=39, null=True, validators=[django.core.validators.validate_ipv46_address]),
        ),
        migrations.AlterField(
            model_name='host',
            name='public_ipv4',
            field=models.CharField(max_length=39, validators=[django.core.validators.validate_ipv46_address]),
        ),
    ]
