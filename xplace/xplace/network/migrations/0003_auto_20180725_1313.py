# Generated by Django 2.0.7 on 2018-07-25 13:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_auto_20180725_1311'),
    ]

    operations = [
        migrations.AlterField(
            model_name='domain',
            name='name',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterUniqueTogether(
            name='domain',
            unique_together={('name', 'include_all_sub_domains')},
        ),
    ]
