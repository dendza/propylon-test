import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from propylon_document_manager.file_versions.models import User, FileVersion
from propylon_document_manager.file_versions.utils import calculate_hash
from .factories import UserFactory, AuthorizedClientFactory
from rest_framework.test import RequestsClient


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass

@pytest.fixture(autouse=True)
def media_storage(settings, tmpdir):
    settings.MEDIA_ROOT = tmpdir.strpath


@pytest.fixture
def user_1(db) -> User:
    return UserFactory()


@pytest.fixture
def user_2(db) -> User:
    return UserFactory()


@pytest.fixture
def unauthorized_client():
    """ Used for testing the access of unauthorized users"""
    return RequestsClient()


@pytest.fixture
def authorized_client_user_1(user_1):
    return AuthorizedClientFactory(user_1).get_client()

@pytest.fixture
def authorized_client_user_2(user_2):
    return AuthorizedClientFactory(user_2).get_client()


@pytest.fixture
def file_fixture_1():
    """Returns a mock uploaded file fixture."""
    file_content = b"Test file content"
    return SimpleUploadedFile("test_file_1.txt", file_content, content_type="text/plain")


@pytest.fixture
def file_fixture_2():
    file_content = b"Content of the second test file"
    return SimpleUploadedFile("test_file_2.txt", file_content, content_type="text/plain")


@pytest.fixture
def file_fixture_3():
    file_content = b"Content of the third test file"
    return SimpleUploadedFile("test_file_3.txt", file_content, content_type="text/plain")

@pytest.fixture
def file_version_for_user_1(file_fixture_1, user_1):
    return FileVersion.objects.create(
        user=user_1,
        url='/test/file_1/test_file_1.txt',
        file=file_fixture_1,
        version_number=0,
        file_name='test_file_1.txt',
        file_hash=calculate_hash(file_fixture_1)
    )

@pytest.fixture
def file_version_for_user_2(file_fixture_2, user_2):
    return FileVersion.objects.create(
        user=user_2,
        url='/test/file_1/test_file_2.txt',
        file=file_fixture_2,
        version_number=0,
        file_name='test_file_2.txt',
        file_hash=calculate_hash(file_fixture_2)
    )
