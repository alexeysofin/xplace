# Generated by Django 2.1.3 on 2018-11-18 17:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compute', '0002_remove_host_backup_path'),
    ]

    operations = [
        migrations.AddField(
            model_name='backup',
            name='filename',
            field=models.CharField(default=None, max_length=255),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='containerevent',
            name='type',
            field=models.CharField(choices=[('STARTED', 'STARTED'), ('STOPPED', 'STOPPED'), ('REBOOTED', 'REBOOTED'), ('PASSWORD_RESET', 'PASSWORD_RESET'), ('BACKED_UP', 'BACKED_UP')], max_length=16),
        ),
    ]
