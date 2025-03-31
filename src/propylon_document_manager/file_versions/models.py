from django.db import models

from propylon_document_manager.accounts.models import User


class FileVersion(models.Model):

    version_number = models.IntegerField()
    file = models.FileField(upload_to="files/", null=True, blank=True)
    url = models.CharField(max_length=512, db_index=True)
    user = models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE)
