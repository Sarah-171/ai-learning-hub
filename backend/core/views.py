from django.db.models import F
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .management.commands.progress_report import create_report
from .models import Achievement, ProgressReport, UserProfile
from .serializers import (
    AchievementSerializer,
    LeaderboardSerializer,
    ProgressReportDetailSerializer,
    ProgressReportListSerializer,
    UserProfileSerializer,
)


class ProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = UserProfileSerializer(request.user.profile)
        return Response(serializer.data)


class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        profiles = UserProfile.objects.order_by(F("xp").desc())[:10]
        serializer = LeaderboardSerializer(profiles, many=True)
        return Response(serializer.data)


class AchievementsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        achievements = Achievement.objects.all()
        serializer = AchievementSerializer(achievements, many=True, context={"request": request})
        return Response(serializer.data)


class ReportListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        reports = ProgressReport.objects.all()
        serializer = ProgressReportListSerializer(reports, many=True)
        return Response(serializer.data)


class ReportDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk):
        try:
            report = ProgressReport.objects.get(pk=pk)
        except ProgressReport.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProgressReportDetailSerializer(report)
        return Response(serializer.data)


class ReportGenerateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        report = create_report()
        serializer = ProgressReportDetailSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
