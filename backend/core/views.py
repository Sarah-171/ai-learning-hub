from django.db.models import F
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .management.commands.progress_report import collect_report_data
from .models import Achievement, UserProfile
from .serializers import AchievementSerializer, LeaderboardSerializer, UserProfileSerializer


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


class ProgressReportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get("days", 7))
        data = collect_report_data(days)
        # Convert datetime to string for JSON
        data["date"] = data["date"].isoformat()
        for u in data["users"]:
            if u["last_activity"]:
                u["last_activity"] = u["last_activity"].isoformat()
        return Response(data)
