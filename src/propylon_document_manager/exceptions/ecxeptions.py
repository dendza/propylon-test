from rest_framework import status
from rest_framework.exceptions import APIException


class UserAlreadyExists(Exception):
    pass


class BadRequestException(APIException):
    def __init__(self, message):
        self.status_code = status.HTTP_400_BAD_REQUEST
        self.default_detail = message
        super(BadRequestException, self).__init__()


class FileUrlQueryParamMissing(BadRequestException):
    pass


class FileNotFoundException(BadRequestException):
    pass
