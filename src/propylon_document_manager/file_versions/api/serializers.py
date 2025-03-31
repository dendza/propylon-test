from rest_framework import serializers

from ..models import FileVersion

class FileVersionSerializer(serializers.ModelSerializer):
    file_hash = serializers.CharField(write_only=True)

    class Meta:
        model = FileVersion
        fields = "__all__"
