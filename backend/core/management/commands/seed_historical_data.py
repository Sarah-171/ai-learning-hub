from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import ProgressReport, UserAchievement, UserProfile
from lessons.models import LearningPath, Lesson, LessonProgress

User = get_user_model()


def last_friday():
    """Return the most recent Friday as a timezone-aware datetime (12:00)."""
    today = timezone.now().replace(hour=12, minute=0, second=0, microsecond=0)
    days_since_friday = (today.weekday() - 4) % 7
    if days_since_friday == 0:
        days_since_friday = 7  # If today is Friday, use *last* Friday
    return today - timedelta(days=days_since_friday)


FRIDAY_ADDITIONS = [
    {
        "username": "anna",
        "extra_lessons": ["chain-of-thought", "was-sind-ai-agents"],
        "extra_xp": 20,
    },
    {
        "username": "marco",
        "extra_lessons": ["tokens-kontext-temperatur"],
        "extra_xp": 10,
    },
    {
        "username": "lisa",
        "extra_lessons": [
            "mcp-model-context-protocol",
            "eigene-workflows-bauen",
        ],
        "extra_xp": 30,
    },
]


def seed_friday_progress(friday_dt, stdout):
    """Add extra lesson completions dated to last Friday."""
    for entry in FRIDAY_ADDITIONS:
        username = entry["username"]
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            stdout.write(f"  WARNING: User '{username}' not found — run seed_testdata first")
            continue

        stdout.write(f"  User '{username}':")

        # Complete extra lessons with Friday timestamp
        for slug in entry["extra_lessons"]:
            try:
                lesson = Lesson.objects.get(slug=slug)
            except Lesson.DoesNotExist:
                stdout.write(f"    WARNING: Lesson '{slug}' not found")
                continue

            progress, created = LessonProgress.objects.get_or_create(
                user=user,
                lesson=lesson,
                defaults={"completed": True, "completed_at": friday_dt},
            )
            if created:
                stdout.write(f"    Completed (Fri): {lesson.title}")
            elif not progress.completed:
                progress.completed = True
                progress.completed_at = friday_dt
                progress.save()
                stdout.write(f"    Marked completed (Fri): {lesson.title}")
            else:
                stdout.write(f"    Already completed: {lesson.title}")

        # Add extra XP
        profile = UserProfile.objects.get(user=user)
        profile.xp += entry["extra_xp"]
        profile.save()
        # Override last_activity (auto_now prevents direct assignment)
        UserProfile.objects.filter(pk=profile.pk).update(last_activity=friday_dt)
        stdout.write(f"    +{entry['extra_xp']} XP, last_activity = {friday_dt.date()}")


def build_friday_report(friday_dt, stdout):
    """Create a ProgressReport reflecting the state as of last Friday."""
    profiles = UserProfile.objects.select_related("user").all()
    paths = list(LearningPath.objects.prefetch_related("lessons").all())

    users_data = []
    total_completed = 0

    for profile in profiles:
        user = profile.user
        completed_progress = LessonProgress.objects.filter(
            user=user, completed=True,
        ).select_related("lesson", "lesson__path")
        completed_lessons = [p.lesson for p in completed_progress]
        completed_count = len(completed_lessons)
        total_completed += completed_count

        total_lessons = sum(p.lessons.count() for p in paths)
        open_count = total_lessons - completed_count

        paths_progress = []
        for path in paths:
            path_total = path.lessons.count()
            if path_total == 0:
                continue
            path_completed = sum(
                1 for lesson in completed_lessons if lesson.path_id == path.id
            )
            percent = round((path_completed / path_total) * 100)
            paths_progress.append({
                "path": path.title,
                "progress_percent": percent,
            })

        achievements = UserAchievement.objects.filter(user=user).select_related(
            "achievement"
        )
        achievement_list = [ua.achievement.name for ua in achievements]

        users_data.append({
            "username": user.username,
            "level": profile.level,
            "xp": profile.xp,
            "streak_days": profile.streak_days,
            "last_activity": friday_dt.strftime("%Y-%m-%d"),
            "completed_lessons": [les.title for les in completed_lessons],
            "open_lessons_count": open_count,
            "paths_progress": paths_progress,
            "achievements": achievement_list,
        })

    user_count = len(users_data)
    avg_level = (
        round(sum(u["level"] for u in users_data) / user_count, 1)
        if user_count > 0
        else 0
    )

    data = {
        "user_count": user_count,
        "avg_level": avg_level,
        "total_completed": total_completed,
        "users": users_data,
    }

    summary = (
        f"<div><p><strong>{data['user_count']}</strong> aktive User, "
        f"Ø Level <strong>{data['avg_level']}</strong>, "
        f"<strong>{data['total_completed']}</strong> Lektionen abgeschlossen.</p></div>"
    )

    name = friday_dt.strftime("%Y%m%d") + "-Fortschrittstracking"

    report, created = ProgressReport.objects.update_or_create(
        name=name,
        defaults={
            "data": data,
            "summary": summary,
            "total_users": data["user_count"],
            "avg_level": data["avg_level"],
            "total_completed_lessons": data["total_completed"],
        },
    )
    # Override auto_now_add created_at to the Friday date
    ProgressReport.objects.filter(pk=report.pk).update(created_at=friday_dt)

    action = "Created" if created else "Updated"
    stdout.write(f"  {action} report: {name} (dated {friday_dt.date()})")
    return report


class Command(BaseCommand):
    help = "Seed historical test data dated to last Friday"

    def handle(self, *args, **options):
        friday_dt = last_friday()
        self.stdout.write(f"Last Friday: {friday_dt.date()}\n")

        self.stdout.write("Seeding Friday lesson progress...")
        seed_friday_progress(friday_dt, self.stdout)

        self.stdout.write("\nBuilding Friday report...")
        build_friday_report(friday_dt, self.stdout)

        self.stdout.write(self.style.SUCCESS("\nHistorical data seeded!"))
