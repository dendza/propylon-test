# Generated by Django 5.0.1 on 2024-03-02 08:51

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("file_versions", "0005_remove_fileversion_owner_id_fileversion_owner"),
    ]

    operations = [
        migrations.AddField(
            model_name="fileversion",
            name="date",
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
