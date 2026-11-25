from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from students.models import Student

SAMPLE_STUDENTS = [
    {"first_name": "Aisha", "last_name": "Rahman", "email": "aisha.rahman@example.com", "phone": "+91 98765 43210", "gender": "female", "department": "computer_science", "year_level": 3, "gpa": "3.82", "status": "active"},
    {"first_name": "Liam", "last_name": "Carter", "email": "liam.carter@example.com", "phone": "+1 415 555 0134", "gender": "male", "department": "engineering", "year_level": 2, "gpa": "3.45", "status": "active"},
    {"first_name": "Sofia", "last_name": "Mendes", "email": "sofia.mendes@example.com", "phone": "+55 11 91234 5678", "gender": "female", "department": "business", "year_level": 4, "gpa": "3.10", "status": "graduated"},
    {"first_name": "Kenji", "last_name": "Tanaka", "email": "kenji.tanaka@example.com", "phone": "+81 3 1234 5678", "gender": "male", "department": "science", "year_level": 1, "gpa": "3.91", "status": "active"},
    {"first_name": "Priya", "last_name": "Nair", "email": "priya.nair@example.com", "phone": "+91 91234 56789", "gender": "female", "department": "arts", "year_level": 2, "gpa": "2.95", "status": "inactive"},
    {"first_name": "Omar", "last_name": "Hassan", "email": "omar.hassan@example.com", "phone": "+20 100 123 4567", "gender": "male", "department": "computer_science", "year_level": 4, "gpa": "3.67", "status": "active"},
    {"first_name": "Emma", "last_name": "Novak", "email": "emma.novak@example.com", "phone": "+420 601 234 567", "gender": "female", "department": "engineering", "year_level": 3, "gpa": "3.28", "status": "active"},
    {"first_name": "Yusuf", "last_name": "Demir", "email": "yusuf.demir@example.com", "phone": "+90 532 123 4567", "gender": "male", "department": "business", "year_level": 1, "gpa": "2.88", "status": "active"},
]


class Command(BaseCommand):
    help = "Creates an admin user (admin / admin123) and demo students."

    def handle(self, *args, **options):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "admin123")

        created = 0
        for data in SAMPLE_STUDENTS:
            _, was_created = Student.objects.get_or_create(email=data["email"], defaults=data)
            created += int(was_created)

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} students. Login: admin / admin123"))
