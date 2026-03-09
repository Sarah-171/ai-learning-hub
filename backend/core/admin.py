from django.contrib import admin

from .models import Achievement, ProgressReport, UserAchievement, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "xp", "level", "streak_days", "last_activity")


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("icon", "name", "requirement_type", "requirement_value", "xp_reward")


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ("user", "achievement", "unlocked_at")


@admin.register(ProgressReport)
class ProgressReportAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at", "total_users", "avg_level", "total_completed_lessons")
