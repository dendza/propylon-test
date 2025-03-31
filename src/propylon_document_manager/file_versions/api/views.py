import copy

from rest_framework import status
from rest_framework.response import Response
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin, CreateModelMixin
from rest_framework.viewsets import GenericViewSet

from .serializers import FileVersionSerializer
from ..models import FileVersion


class FileVersionViewSet(CreateModelMixin, RetrieveModelMixin, ListModelMixin, GenericViewSet):

    serializer_class = FileVersionSerializer
    lookup_field = "id"

    def get_queryset(self):
        return FileVersion.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = copy.deepcopy(request.data)
        data.update({
            "user": request.user.id,
            "version_number": 1
        })
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
