# Generated by Django 2.1.3 on 2018-11-14 15:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0006_reverseproxy_endpoint'),
    ]

    operations = [
        migrations.RenameField(
            model_name='domain',
            old_name='include_all_sub_domains',
            new_name='include_sub_domains',
        ),
        migrations.AddField(
            model_name='domain',
            name='backend_id',
            field=models.UUIDField(null=True),
        ),
        migrations.AlterUniqueTogether(
            name='domain',
            unique_together={('name', 'include_sub_domains')},
        ),
    ]
