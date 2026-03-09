from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import ProgressReport, UserAchievement, UserProfile
from lessons.models import LearningPath, LessonProgress

User = get_user_model()


def collect_report_data():
    """Collect progress data for all active users."""
    profiles = UserProfile.objects.select_related("user").all()
    paths = list(LearningPath.objects.prefetch_related("lessons").all())

    users_data = []
    total_completed = 0

    for profile in profiles:
        user = profile.user

        # Completed lessons
        completed_progress = LessonProgress.objects.filter(
            user=user, completed=True
        ).select_related("lesson", "lesson__path")
        completed_lessons = [p.lesson for p in completed_progress]
        completed_count = len(completed_lessons)
        total_completed += completed_count

        # Open lessons count
        total_lessons = sum(p.lessons.count() for p in paths)
        open_count = total_lessons - completed_count

        # Progress per path
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

        # Achievements
        achievements = UserAchievement.objects.filter(user=user).select_related(
            "achievement"
        )
        achievement_list = [ua.achievement.name for ua in achievements]

        last_activity = (
            profile.last_activity.strftime("%Y-%m-%d")
            if profile.last_activity
            else None
        )

        users_data.append({
            "username": user.username,
            "level": profile.level,
            "xp": profile.xp,
            "streak_days": profile.streak_days,
            "last_activity": last_activity,
            "completed_lessons": [lesson.title for lesson in completed_lessons],
            "open_lessons_count": open_count,
            "paths_progress": paths_progress,
            "achievements": achievement_list,
        })

    # Summary
    user_count = len(users_data)
    avg_level = (
        round(sum(u["level"] for u in users_data) / user_count, 1)
        if user_count > 0
        else 0
    )

    return {
        "user_count": user_count,
        "avg_level": avg_level,
        "total_completed": total_completed,
        "users": users_data,
    }


def render_summary_html(data):
    """Render a short HTML summary for the report."""
    return f"""<div>
<p><strong>{data['user_count']}</strong> aktive User,
Ø Level <strong>{data['avg_level']}</strong>,
<strong>{data['total_completed']}</strong> Lektionen abgeschlossen.</p>
</div>"""


def create_report():
    """Collect data and save a ProgressReport to the database."""
    data = collect_report_data()
    name = timezone.now().strftime("%Y%m%d") + "-Fortschrittstracking"

    report, _created = ProgressReport.objects.update_or_create(
        name=name,
        defaults={
            "data": data,
            "summary": render_summary_html(data),
            "total_users": data["user_count"],
            "avg_level": data["avg_level"],
            "total_completed_lessons": data["total_completed"],
        },
    )
    return report


class Command(BaseCommand):
    help = "Generate a progress report and save it to the database"

    def handle(self, *args, **options):
        self.stdout.write("Collecting data...")
        report = create_report()
        self.stdout.write(self.style.SUCCESS(f"Report {report.name} erstellt."))
