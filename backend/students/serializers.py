import re

from rest_framework import serializers

from .models import Student

PHONE_PATTERN = re.compile(r"^[0-9+\-\s()]{7,20}$")


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "student_id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "date_of_birth",
            "gender",
            "department",
            "year_level",
            "gpa",
            "status",
            "address",
            "enrollment_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["student_id", "created_at", "updated_at"]

    def validate_first_name(self, value: str) -> str:
        return value.strip()

    def validate_last_name(self, value: str) -> str:
        return value.strip()

    def validate_phone(self, value: str) -> str:
        if value and not PHONE_PATTERN.match(value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value
