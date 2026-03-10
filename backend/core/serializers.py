from rest_framework import serializers

from lessons.models import Lesson, LessonProgress

from .models import Achievement, ProgressReport, UserAchievement, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    completed_lessons_count = serializers.SerializerMethodField()
    total_lessons_count = serializers.SerializerMethodField()
    recent_achievements = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            "username", "xp", "level", "streak_days", "avatar_color",
            "completed_lessons_count", "total_lessons_count", "recent_achievements",
        )

    def get_completed_lessons_count(self, obj):
        return LessonProgress.objects.filter(user=obj.user, completed=True).count()

    def get_total_lessons_count(self, obj):
        return Lesson.objects.count()

    def get_recent_achievements(self, obj):
        recent = (
            UserAchievement.objects.filter(user=obj.user)
            .select_related("achievement")
            .order_by("-unlocked_at")[:3]
        )
        return [
            {
                "icon": ua.achievement.icon,
                "name": ua.achievement.name,
                "unlocked_at": ua.unlocked_at.isoformat(),
            }
            for ua in recent
        ]


class UserProfileDetailSerializer(serializers.ModelSerializer):
    """Full profile with ALL achievements (not just recent 3)."""

    username = serializers.CharField(source="user.username", read_only=True)
    completed_lessons_count = serializers.SerializerMethodField()
    total_lessons_count = serializers.SerializerMethodField()
    achievements = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            "username", "xp", "level", "streak_days", "avatar_color",
            "completed_lessons_count", "total_lessons_count", "achievements",
        )

    def get_completed_lessons_count(self, obj):
        return LessonProgress.objects.filter(user=obj.user, completed=True).count()

    def get_total_lessons_count(self, obj):
        return Lesson.objects.count()

    def get_achievements(self, obj):
        all_ua = (
            UserAchievement.objects.filter(user=obj.user)
            .select_related("achievement")
            .order_by("-unlocked_at")
        )
        return [
            {
                "icon": ua.achievement.icon,
                "name": ua.achievement.name,
                "unlocked_at": ua.unlocked_at.isoformat(),
            }
            for ua in all_ua
        ]


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
        fields = ("id", "name", "created_at", "total_users", "avg_level", "total_completed_lessons", "summary")


class ProgressReportDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressReport
        fields = ("id", "name", "created_at", "data", "summary", "total_users", "avg_level", "total_completed_lessons")
