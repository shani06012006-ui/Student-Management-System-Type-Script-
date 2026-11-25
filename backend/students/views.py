import csv

from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Student
from .serializers import StudentSerializer

GPA_BANDS = [
    ("Below 2.0", 0.0, 2.0),
    ("2.0 – 2.49", 2.0, 2.5),
    ("2.5 – 2.99", 2.5, 3.0),
    ("3.0 – 3.49", 3.0, 3.5),
    ("3.5 – 4.0", 3.5, 4.01),
]


def _round(value) -> float | None:
    return round(float(value), 2) if value is not None else None


class StudentViewSet(viewsets.ModelViewSet):
    """
    CRUD for students.
    Filters: ?search=  ?status=  ?department=  ?year_level=  ?ordering=  ?page=
    Extra:   GET /students/stats/   GET /students/export/
    """

    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    search_fields = ["first_name", "last_name", "email", "student_id"]
    ordering_fields = [
        "created_at",
        "first_name",
        "last_name",
        "student_id",
        "gpa",
        "year_level",
        "enrollment_date",
    ]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        if status := params.get("status"):
            qs = qs.filter(status=status)
        if department := params.get("department"):
            qs = qs.filter(department=department)
        if (year := params.get("year_level")) and year.isdigit():
            qs = qs.filter(year_level=int(year))
        return qs

    @action(detail=False, methods=["get"])
    def stats(self, request: Request) -> Response:
        qs = Student.objects.all()

        totals = qs.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(status=Student.Status.ACTIVE)),
            inactive=Count("id", filter=Q(status=Student.Status.INACTIVE)),
            graduated=Count("id", filter=Q(status=Student.Status.GRADUATED)),
            average_gpa=Avg("gpa"),
        )

        by_department = [
            {
                "department": row["department"],
                "label": Student.Department(row["department"]).label,
                "count": row["count"],
                "active": row["active"],
                "average_gpa": _round(row["avg_gpa"]),
            }
            for row in qs.order_by()
            .values("department")
            .annotate(
                count=Count("id"),
                active=Count("id", filter=Q(status=Student.Status.ACTIVE)),
                avg_gpa=Avg("gpa"),
            )
            .order_by("-count")
        ]

        year_rows = {
            row["year_level"]: row["count"]
            for row in qs.order_by().values("year_level").annotate(count=Count("id"))
        }
        by_year = [{"year_level": y, "count": year_rows.get(y, 0)} for y in range(1, 7)]

        by_gender = [
            {
                "gender": row["gender"],
                "label": Student.Gender(row["gender"]).label,
                "count": row["count"],
            }
            for row in qs.order_by()
            .values("gender")
            .annotate(count=Count("id"))
            .order_by("-count")
        ]

        gpas = [float(g) for g in qs.exclude(gpa=None).values_list("gpa", flat=True)]
        gpa_distribution = [
            {"label": label, "count": sum(1 for g in gpas if low <= g < high)}
            for label, low, high in GPA_BANDS
        ]

        trend_rows = (
            qs.order_by()
            .annotate(month=TruncMonth("enrollment_date"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        enrollment_trend = [
            {"month": row["month"].strftime("%Y-%m"), "count": row["count"]}
            for row in trend_rows
            if row["month"] is not None
        ]

        recent = StudentSerializer(qs.order_by("-created_at")[:5], many=True).data
        top_students = StudentSerializer(
            qs.exclude(gpa=None).order_by("-gpa", "last_name")[:5], many=True
        ).data

        return Response(
            {
                **totals,
                "average_gpa": _round(totals["average_gpa"]),
                "by_department": by_department,
                "by_year": by_year,
                "by_gender": by_gender,
                "gpa_distribution": gpa_distribution,
                "enrollment_trend": enrollment_trend,
                "recent": recent,
                "top_students": top_students,
            }
        )

    @action(detail=False, methods=["get"])
    def export(self, request: Request) -> HttpResponse:
        rows = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="students.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "Student ID",
                "First name",
                "Last name",
                "Email",
                "Phone",
                "Gender",
                "Department",
                "Year",
                "GPA",
                "Status",
                "Enrollment date",
            ]
        )
        for s in rows:
            writer.writerow(
                [
                    s.student_id or "",
                    s.first_name,
                    s.last_name,
                    s.email,
                    s.phone,
                    s.get_gender_display(),
                    s.get_department_display(),
                    s.year_level,
                    s.gpa or "",
                    s.get_status_display(),
                    s.enrollment_date,
                ]
            )
        return response