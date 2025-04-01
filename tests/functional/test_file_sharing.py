

def test_file_sharing(authorized_client_user_1, file_fixture_1, user_1, user_2, authorized_client_user_2):
    """
        Testing the basic read permission grant
    """

    file = {
        "file": file_fixture_1
    }
    data = {
        "url": "/document/upload.txt",
    }
    response = authorized_client_user_1.post('https://testserver/api/file_versions/', data=data, files=file)
    assert response.status_code == 201

    # list files created by user
    response = authorized_client_user_1.get('https://testserver/api/file_versions/')
    response_data = response.json()
    assert response.status_code == 200
    assert len(response_data) == 1
    file_id = response_data[0]["id"]

    # there are no files available for retrieval for user 2
    response = authorized_client_user_2.get('https://testserver/api/file_versions/')
    response_data = response.json()
    assert response.status_code == 200
    assert len(response_data) == 0

    data = {
        "share_with_user_id": user_2.id,
    }
    response = authorized_client_user_1.post(f'https://testserver/api/file_versions/{file_id}/share_file/', data=data)
    assert response.status_code == 200

    # after the file was shared with the user it is now able to retrieve it
    response = authorized_client_user_2.get('https://testserver/api/file_versions/')
    response_data = response.json()
    assert response.status_code == 200
    assert len(response_data) == 1
    assert response_data[0]['url'] == '/document/upload.txt'


def test_write_only_for_owners(authorized_client_user_1, file_fixture_1, user_1, user_2, authorized_client_user_2):

    file = {
        "file": file_fixture_1
    }
    data = {
        "url": "/document/upload.txt",
    }
    response = authorized_client_user_1.post('https://testserver/api/file_versions/', data=data, files=file)
    assert response.status_code == 201
    response = authorized_client_user_1.get('https://testserver/api/file_versions/')
    response_data = response.json()
    assert response.status_code == 200
    assert len(response_data) == 1
    file_id = response_data[0]["id"]


    # by default user has no read nor write access to the file uploaded by some other user
    response = authorized_client_user_2.post('https://testserver/api/file_versions/', data=data, files=file)
    assert response.status_code == 400
    response = authorized_client_user_2.get(
        f'https://testserver/api/file_versions/get_file_by_url?file_url=/document/upload.txt')
    assert response.status_code == 400


    data = {
        "share_with_user_id": user_2.id,
    }
    response = authorized_client_user_1.post(f'https://testserver/api/file_versions/{file_id}/share_file/', data=data)
    assert response.status_code == 200

    # after the file is shared user can access the file with read permission but still can't write
    data = {
        "url": "/document/upload.txt",
    }
    response = authorized_client_user_2.post('https://testserver/api/file_versions/', data=data, files=file)
    assert response.status_code == 400
    response = authorized_client_user_2.get(
        f'https://testserver/api/file_versions/get_file_by_url?file_url=/document/upload.txt')
    assert response.status_code == 200


def test_sharing_only_the_files_that_user_owns(authorized_client_user_1, file_fixture_1, user_1, user_2, authorized_client_user_2):

    file = {
        "file": file_fixture_1
    }
    data = {
        "url": "/document/upload.txt",
    }
    response = authorized_client_user_1.post('https://testserver/api/file_versions/', data=data, files=file)
    assert response.status_code == 201

    # list files created by user
    response = authorized_client_user_1.get('https://testserver/api/file_versions/')
    response_data = response.json()
    assert response.status_code == 200
    assert len(response_data) == 1
    file_id = response_data[0]["id"]

    data = {
        "share_with_user_id": user_2.id,
    }
    # user trying to share the file that it doesn't own with itself
    response = authorized_client_user_2.post(f'https://testserver/api/file_versions/{file_id}/share_file/', data=data)
    assert response.status_code == 404
