import pytest
from django.db import IntegrityError

from propylon_document_manager.file_versions.models import FileVersion, ReadFileVersionPermission


def test_sharing_unique_restrictions(file_fixture_1, user_1, user_2):
    with pytest.raises(IntegrityError):
        file_version = FileVersion.objects.create(
            version_number=0,
            file=file_fixture_1,
            url='/test/doc.txt',
            user=user_1,
            file_name='doc.txt',
            file_hash='asg64hdikf'
        )

        ReadFileVersionPermission.objects.create(
            file_version=file_version,
            shared_with=user_2
        )

        # file can only be shared with one user once
        ReadFileVersionPermission.objects.create(
            file_version=file_version,
            shared_with=user_2
        )
