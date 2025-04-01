from propylon_document_manager.file_versions.models import FileVersion


def test_base_file_storing(authorized_client_user_1, file_fixture_1, user_1):

    file = {
        "file": file_fixture_1
    }
    data = {
        "url": "/document/upload.txt",
    }

    response = authorized_client_user_1.post('https://testserver/api/file_versions/', data=data, files=file)
    response_data = response.json()
    assert response.status_code == 201
    assert response_data['file_name'] == "test_file_1.txt"
    assert response_data['url'] == data['url']
    assert response_data['user'] == user_1.id


def test_upload_and_retrieval_of_new_revision(authorized_client_user_1, file_fixture_1,
                                              file_fixture_2, file_fixture_3, user_1):

    file = {"file": file_fixture_1}
    data = {"url": "/document/upload.txt"}

    response = authorized_client_user_1.post('https://testserver/api/file_versions/', data=data, files=file)
    response_data = response.json()
    assert response.status_code == 201
    assert response_data['version_number'] == 0

    file = {"file": file_fixture_2}
    response = authorized_client_user_1.post('https://testserver/api/file_versions/', data=data, files=file)
    response_data = response.json()
    assert response.status_code == 201
    assert response_data['file_name'] == "test_file_2.txt"
    assert response_data['url'] == data['url']
    assert response_data['user'] == user_1.id
    assert response_data['version_number'] == 1

    # add one more file, which is now the latest revision of the document
    file = {"file": file_fixture_3}
    authorized_client_user_1.post('https://testserver/api/file_versions/', data=data, files=file)


    # this should retrieve the latest version
    response = authorized_client_user_1.get(
        f'https://testserver/api/file_versions/get_file_by_url?file_url={data["url"]}')
    assert response.status_code == 200
    assert response.text == file_fixture_3.file.getvalue().decode('UTF-8')

    # this should retrieve the first version
    url=f"{data['url']}?revision=0"
    response = authorized_client_user_1.get(
        f'https://testserver/api/file_versions/get_file_by_url?file_url={url}')
    assert response.status_code == 200
    assert response.text == file_fixture_1.file.getvalue().decode('UTF-8')

    # we can also retrieve any revision that exists
    url=f"{data['url']}?revision=1"
    response = authorized_client_user_1.get(
        f'https://testserver/api/file_versions/get_file_by_url?file_url={url}')
    assert response.status_code == 200
    assert response.text == file_fixture_2.file.getvalue().decode('UTF-8')

    # asking for a revision that does not exist returns bad request
    url=f"{data['url']}?revision=5"
    response = authorized_client_user_1.get(
        f'https://testserver/api/file_versions/get_file_by_url?file_url={url}')
    assert response.status_code == 400


def test_cas_mechanism_retrieval(authorized_client_user_1, file_fixture_1,
                                              file_fixture_2, file_fixture_3, user_1):
    file = {"file": file_fixture_1}
    data = {"url": "/document/upload.txt"}
    response = authorized_client_user_1.post('https://testserver/api/file_versions/', data=data, files=file)
    response_data = response.json()
    assert response.status_code == 201

    # get the hash ot the file that was generated based on content
    file_version = FileVersion.objects.get(id=response_data['id'])

    # lookup will return list of files uploaded by this user that match the given content
    response = authorized_client_user_1.get(
        f'https://testserver/api/file_versions/search_documents_by_hash?file_hash={file_version.file_hash}')
    response_data = response.json()
    assert len(response_data) == 1
    assert response.status_code == 200
    assert response_data[0]['file_name'] == "test_file_1.txt"
    assert response_data[0]['url'] == data['url']


    # lookup for the incorrect hash returns no results
    response = authorized_client_user_1.get(
        'https://testserver/api/file_versions/search_documents_by_hash?file_hash=someHash')
    response_data = response.json()
    assert len(response_data) == 0
    assert response.status_code == 200
