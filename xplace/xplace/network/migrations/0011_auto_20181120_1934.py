# Generated by Django 2.1.3 on 2018-11-20 19:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0010_auto_20181120_1934'),
    ]

    operations = [
        migrations.AlterField(
            model_name='domain',
            name='backend_id',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
