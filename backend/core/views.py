from django.contrib.auth import get_user_model
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
    UserProfileDetailSerializer,
    UserProfileSerializer,
)

User = get_user_model()


class ProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
        else:
            # Dev fallback: use first user from DB
            user = User.objects.first()
            if not user:
                return Response({"detail": "No users found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserProfileSerializer(user.profile)
        return Response(serializer.data)


class ProfileListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        profiles = UserProfile.objects.select_related("user").order_by("user__username")
        serializer = UserProfileSerializer(profiles, many=True)
        return Response(serializer.data)


class ProfileDetailByUsernameView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            profile = UserProfile.objects.select_related("user").get(user__username=username)
        except UserProfile.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserProfileDetailSerializer(profile)
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
    permission_classes = [permissions.AllowAny]  # TODO: restrict to IsAdminUser after auth

    def get(self, request):
        reports = ProgressReport.objects.all()
        serializer = ProgressReportListSerializer(reports, many=True)
        return Response(serializer.data)


class ReportDetailView(APIView):
    permission_classes = [permissions.AllowAny]  # TODO: restrict to IsAdminUser after auth

    def get(self, request, pk):
        try:
            report = ProgressReport.objects.get(pk=pk)
        except ProgressReport.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProgressReportDetailSerializer(report)
        return Response(serializer.data)


class ReportGenerateView(APIView):
    permission_classes = [permissions.AllowAny]  # TODO: restrict to IsAdminUser after auth

    def post(self, request):
        report = create_report()
        serializer = ProgressReportDetailSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
