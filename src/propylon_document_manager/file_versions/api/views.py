import copy
import hashlib
from urllib.parse import urlparse, parse_qs

from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin, CreateModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .serializers import FileVersionSerializer
from ..models import FileVersion
from ...exceptions.ecxeptions import FileNotFoundException, QueryParamMissing


class FileVersionViewSet(CreateModelMixin, ListModelMixin, GenericViewSet):

    serializer_class = FileVersionSerializer

    def get_queryset(self):
        return FileVersion.objects.filter(user=self.request.user)

    @staticmethod
    def calculate_hash(file):
        """
            Calculate SHA-256 hash of the file contents.
        """
        if not file:
            return None
        hasher = hashlib.sha256()
        file.seek(0)
        for chunk in file.chunks():
            hasher.update(chunk)
        return hasher.hexdigest()

    def create(self, request, *args, **kwargs):
        data = copy.deepcopy(request.data)
        # we are only interested in the parsed_url as revision numbers will never be sent
        # during a creation of the new instance
        parsed_url, query_params = self._parse_url(data['url'])
        queryset = self.get_queryset()
        file_version = queryset.filter(url=parsed_url).order_by('-version_number').all()

        # file provided by client
        file = data.get('file')

        # if we find that the file with the given URL already exist
        # create a new instance while bumping the file version
        # otherwise, set the version to 0
        new_instance_version = 0
        if file_version:
            new_instance_version = file_version[0].version_number + 1

        data.update({
            "user": request.user.id,
            "version_number": new_instance_version,
            "file_name": file.name,
            "file_hash": self.calculate_hash(file)
        })
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @staticmethod
    def _parse_url(url):
        parsed_url = urlparse(url)
        query_params = parse_qs(parsed_url.query)
        return parsed_url.path, query_params

    @action(detail=False, methods=['GET'])
    def get_file_by_url(self, request, *args, **kwargs):
        """
            Retrieve a file using the url provided as the queryparam

            Method will try to find and retrieve the appropriate version
            based on the given URL. If the submitted URL does not contain `revision`
            param it will fetch the latest version of the file with the given URL.
            Otherwise, it will return the requested revision
        """
        queryset = self.get_queryset()
        if not (file_url := request.query_params.get('file_url')):
            raise QueryParamMissing("You must provide 'file_url' query param")
        parsed_url, query_params = self._parse_url(file_url)
        file_version = None
        if not query_params:
            file_version = queryset.filter(url=parsed_url).order_by('-version_number').first()
        elif 'revision' in query_params.keys():
            filtered_queryset = queryset.filter(url=parsed_url, version_number=query_params['revision'][0])
            try:
                file_version = filtered_queryset.get()
            except FileVersion.DoesNotExist:
                pass

        if not file_version:
            raise FileNotFoundException(f"Could not find a file with url '{file_url}'")

        file_path = file_version.file.path
        response = FileResponse(open(file_path, 'rb'), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{file_version.file.name}"'
        return response

    @action(detail=False, methods=['GET'])
    def search_documents_by_hash(self, request, *args, **kwargs):
        """
            Retrieve all documents for a user that match the given content hash
        """
        queryset = self.get_queryset()
        if not (file_hash := request.query_params.get('file_hash')):
            raise QueryParamMissing("You must provide 'file_hash' query param")

        return Response(self.get_serializer_class()(instance=queryset.filter(file_hash=file_hash), many=True).data)
