from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("student_id", "full_name", "email", "department", "year_level", "status")
    list_filter = ("status", "department", "year_level")
    search_fields = ("first_name", "last_name", "email", "student_id")
    readonly_fields = ("student_id", "created_at", "updated_at")
