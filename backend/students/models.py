from datetime import date

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Student(models.Model):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        GRADUATED = "graduated", "Graduated"

    class Department(models.TextChoices):
        COMPUTER_SCIENCE = "computer_science", "Computer Science"
        ENGINEERING = "engineering", "Engineering"
        BUSINESS = "business", "Business"
        ARTS = "arts", "Arts"
        SCIENCE = "science", "Science"

    # Generated after the first save (STU-00001 style); NULL until then.
    student_id = models.CharField(max_length=20, unique=True, null=True, blank=True, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.OTHER)
    department = models.CharField(max_length=30, choices=Department.choices)
    year_level = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(6)],
    )
    gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(4)],
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    address = models.TextField(blank=True)
    enrollment_date = models.DateField(default=date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.student_id:
            self.student_id = f"STU-{self.pk:05d}"
            Student.objects.filter(pk=self.pk).update(student_id=self.student_id)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __str__(self) -> str:
        return f"{self.student_id or self.pk} - {self.full_name}"
