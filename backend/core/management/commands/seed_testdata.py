from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Achievement, UserAchievement, UserProfile
from lessons.models import Lesson, LessonProgress

User = get_user_model()

TEST_USERS = [
    {
        "username": "anna",
        "password": "test123",
        "xp": 80,
        "level": 1,
        "streak_days": 5,
        "avatar_color": "#00B8D9",
        "lessons": [
            "was-ist-ki",
            "wie-funktionieren-llms",
            "tokens-kontext-temperatur",
            "dein-erster-prompt",
            "klare-anweisungen",
            "few-shot-prompting",
        ],
        "achievements": ["first_lesson", "first_chat"],
    },
    {
        "username": "marco",
        "password": "test123",
        "xp": 40,
        "level": 1,
        "streak_days": 2,
        "avatar_color": "#FFC107",
        "lessons": [
            "was-ist-ki",
            "wie-funktionieren-llms",
            "klare-anweisungen",
        ],
        "achievements": ["first_lesson"],
    },
    {
        "username": "lisa",
        "password": "test123",
        "xp": 150,
        "level": 2,
        "streak_days": 8,
        "avatar_color": "#8E33FF",
        "lessons": [
            "was-ist-ki",
            "wie-funktionieren-llms",
            "tokens-kontext-temperatur",
            "dein-erster-prompt",
            "klare-anweisungen",
            "few-shot-prompting",
            "chain-of-thought",
            "was-sind-ai-agents",
            "tool-use-function-calling",
            "multi-agent-systeme",
        ],
        "achievements": ["first_lesson", "first_chat", "three_streak", "xp_100"],
    },
]

ADMIN_DATA = {
    "username": "admin",
    "xp": 20,
    "lessons": [
        "was-ist-ki",
        "wie-funktionieren-llms",
    ],
}


def seed_user(data, stdout):
    username = data["username"]
    password = data.get("password")

    user, created = User.objects.get_or_create(
        username=username,
        defaults={"is_active": True},
    )
    if created and password:
        user.set_password(password)
        user.save()
        stdout.write(f"  Created user '{username}'")
    else:
        stdout.write(f"  User '{username}' already exists")

    # Update profile
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.xp = data.get("xp", profile.xp)
    profile.level = data.get("level", profile.level)
    profile.streak_days = data.get("streak_days", profile.streak_days)
    if "avatar_color" in data:
        profile.avatar_color = data["avatar_color"]
    profile.save()

    # Completed lessons
    for slug in data.get("lessons", []):
        try:
            lesson = Lesson.objects.get(slug=slug)
        except Lesson.DoesNotExist:
            stdout.write(f"    Warning: Lesson '{slug}' not found")
            continue
        _, lp_created = LessonProgress.objects.get_or_create(
            user=user,
            lesson=lesson,
            defaults={"completed": True, "completed_at": timezone.now()},
        )
        if lp_created:
            stdout.write(f"    Completed: {lesson.title}")
        else:
            stdout.write(f"    Already completed: {lesson.title}")

    # Achievements
    for slug in data.get("achievements", []):
        try:
            achievement = Achievement.objects.get(slug=slug)
        except Achievement.DoesNotExist:
            stdout.write(f"    Warning: Achievement '{slug}' not found")
            continue
        _, ua_created = UserAchievement.objects.get_or_create(
            user=user,
            achievement=achievement,
        )
        if ua_created:
            stdout.write(f"    Unlocked: {achievement.name}")
        else:
            stdout.write(f"    Already unlocked: {achievement.name}")


class Command(BaseCommand):
    help = "Seed test users with progress data, achievements, and XP"

    def handle(self, *args, **options):
        for data in TEST_USERS:
            seed_user(data, self.stdout)
            self.stdout.write("")

        # Admin user
        if User.objects.filter(username="admin").exists():
            seed_user(ADMIN_DATA, self.stdout)
            self.stdout.write("")

        self.stdout.write(self.style.SUCCESS("Test data seeded!"))
