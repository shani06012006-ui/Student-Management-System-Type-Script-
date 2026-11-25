from django.db.models import Avg, Count, Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    CRUD for students.
    Query params: ?search=, ?status=, ?department=, ?ordering=, ?page=
    """

    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    search_fields = ["first_name", "last_name", "email", "student_id"]
    ordering_fields = ["created_at", "first_name", "last_name", "gpa", "year_level"]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        if status := params.get("status"):
            qs = qs.filter(status=status)
        if department := params.get("department"):
            qs = qs.filter(department=department)
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
        totals["average_gpa"] = (
            round(float(totals["average_gpa"]), 2) if totals["average_gpa"] is not None else None
        )
        by_department = qs.order_by().values("department").annotate(count=Count("id")).order_by("-count")
        totals["by_department"] = [
            {
                "department": row["department"],
                "label": Student.Department(row["department"]).label,
                "count": row["count"],
            }
            for row in by_department
        ]
        return Response(totals)
