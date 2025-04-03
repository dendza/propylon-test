from django.db import models

from propylon_document_manager.accounts.models import User


class FileVersion(models.Model):
    version_number = models.IntegerField()
    file = models.FileField(upload_to="files/", null=True, blank=True)
    url = models.CharField(max_length=512, db_index=True)
    user = models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE, related_name="file_versions")
    file_name = models.CharField(max_length=512)
    file_hash = models.CharField(max_length=64, db_index=True)

    class Meta:
        unique_together = ("url", "version_number")


class ReadFileVersionPermission(models.Model):
    file_version = models.ForeignKey(FileVersion, on_delete=models.CASCADE, related_name="shared_file_permissions")
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shared_files")

    class Meta:
        unique_together = ("file_version", "shared_with")
