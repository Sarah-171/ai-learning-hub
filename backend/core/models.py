from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    streak_days = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    avatar_color = models.CharField(max_length=20, default="#00A76F")

    def __str__(self):
        return self.user.username


class Achievement(models.Model):
    REQUIREMENT_TYPES = [
        ("lessons_completed", "Lessons Completed"),
        ("streak", "Streak"),
        ("xp_total", "XP Total"),
        ("first_chat", "First Chat"),
    ]

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=10)
    xp_reward = models.IntegerField(default=10)
    requirement_type = models.CharField(max_length=20, choices=REQUIREMENT_TYPES)
    requirement_value = models.IntegerField(default=1)

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_achievements",
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name="user_achievements",
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "achievement")

    def __str__(self):
        return f"{self.user.username} — {self.achievement.name}"


class ProgressReport(models.Model):
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(default=dict)
    summary = models.TextField(blank=True, default="")
    total_users = models.IntegerField(default=0)
    avg_level = models.FloatField(default=0)
    total_completed_lessons = models.IntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
