# Generated by Django 2.1.3 on 2018-11-25 22:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0011_auto_20181120_1934'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reverseproxy',
            name='endpoint',
        ),
    ]
