from rest_framework import serializers

from .models import Achievement, ProgressReport, UserAchievement, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserProfile
        fields = ("username", "xp", "level", "streak_days", "avatar_color")


class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserProfile
        fields = ("username", "xp", "level", "avatar_color")


class AchievementSerializer(serializers.ModelSerializer):
    unlocked = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ("slug", "name", "description", "icon", "xp_reward", "requirement_type", "requirement_value", "unlocked")

    def get_unlocked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return UserAchievement.objects.filter(user=request.user, achievement=obj).exists()
        return False


class ProgressReportListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressReport
        fields = ("id", "name", "created_at", "total_users", "avg_level", "total_completed_lessons")


class ProgressReportDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressReport
        fields = ("id", "name", "created_at", "data", "summary", "total_users", "avg_level", "total_completed_lessons")
