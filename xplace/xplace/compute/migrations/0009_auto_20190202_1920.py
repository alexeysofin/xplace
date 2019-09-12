# Generated by Django 2.1.5 on 2019-02-02 19:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compute', '0008_auto_20190202_1700'),
    ]

    operations = [
        migrations.AlterField(
            model_name='container',
            name='state',
            field=models.CharField(choices=[('CREATING', 'CREATING'), ('UPDATING', 'UPDATING'), ('STOPPING', 'STOPPING'), ('STOPPED', 'STOPPED'), ('STARTING', 'STARTING'), ('RUNNING', 'RUNNING'), ('REBOOTING', 'REBOOTING'), ('DELETING', 'DELETING'), ('BACKING_UP', 'BACKING_UP'), ('RESTORING', 'RESTORING')], default='CREATING', max_length=16),
        ),
    ]
