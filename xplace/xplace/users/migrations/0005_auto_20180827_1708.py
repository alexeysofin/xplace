# Generated by Django 2.1 on 2018-08-27 17:08

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_sshkey_hash_md5'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='registrationtoken',
            name='invite',
        ),
        migrations.AlterField(
            model_name='sshkey',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ssh_keys', to=settings.AUTH_USER_MODEL),
        ),
    ]
