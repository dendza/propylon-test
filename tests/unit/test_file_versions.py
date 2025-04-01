import pytest
from django.db import IntegrityError

from propylon_document_manager.file_versions.api.serializers import FileVersionSerializer
from propylon_document_manager.file_versions.models import FileVersion


# file version and url must form a unique pair
def test_file_versions_unique_constraint(file_fixture_1, user_1, file_fixture_2):
    with pytest.raises(IntegrityError):
        FileVersion.objects.create(
            version_number=0,
            file=file_fixture_1,
            url='/test/doc.txt',
            user=user_1,
            file_name='doc.txt',
            file_hash='asg64hdikf'
        )

        FileVersion.objects.create(
            version_number=0,
            file=file_fixture_2,
            url='/test/doc.txt',
            user=user_1,
            file_name='different_name.txt',
            file_hash='asg64hdikf'
        )


# content hash is a write only field and should not be a part of the serializer output
def test_content_hash_write_only_field(file_fixture_1, user_1):
    file_version = FileVersion.objects.create(
        version_number=0,
        file=file_fixture_1,
        url='/test/doc.txt',
        user=user_1,
        file_name='doc.txt',
        file_hash='asg64hdikf'
    )

    data = FileVersionSerializer(instance=file_version).data
    assert 'file_hash' not in data
