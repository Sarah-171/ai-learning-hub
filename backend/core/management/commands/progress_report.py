from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import UserAchievement, UserProfile
from lessons.models import LearningPath, LessonProgress

User = get_user_model()


def collect_report_data(days):
    """Collect progress data for all active users."""
    cutoff = timezone.now() - timedelta(days=days)
    profiles = UserProfile.objects.filter(last_activity__gte=cutoff).select_related("user")

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
        path_progress = []
        for path in paths:
            path_total = path.lessons.count()
            if path_total == 0:
                continue
            path_completed = sum(
                1 for lesson in completed_lessons if lesson.path_id == path.id
            )
            percent = round((path_completed / path_total) * 100)
            path_progress.append({
                "title": path.title,
                "icon": path.icon,
                "completed": path_completed,
                "total": path_total,
                "percent": percent,
            })

        # Achievements
        achievements = UserAchievement.objects.filter(user=user).select_related(
            "achievement"
        )
        achievement_list = [
            {"name": ua.achievement.name, "icon": ua.achievement.icon}
            for ua in achievements
        ]

        users_data.append({
            "username": user.username,
            "level": profile.level,
            "xp": profile.xp,
            "streak_days": profile.streak_days,
            "last_activity": profile.last_activity,
            "completed_count": completed_count,
            "completed_lessons": [lesson.title for lesson in completed_lessons],
            "open_count": open_count,
            "path_progress": path_progress,
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
        "date": timezone.now(),
        "days": days,
        "user_count": user_count,
        "avg_level": avg_level,
        "total_completed": total_completed,
        "users": users_data,
    }


def render_html(data):
    """Render report as HTML email."""
    date_str = data["date"].strftime("%d.%m.%Y %H:%M")

    users_html = ""
    for u in data["users"]:
        # Path progress bars
        paths_html = ""
        for p in u["path_progress"]:
            bar_color = "#00A76F" if p["percent"] >= 100 else "#00B8D9" if p["percent"] >= 50 else "#FFC107"
            paths_html += f"""
            <div style="margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px;">
                <span>{p['icon']} {p['title']}</span>
                <span style="font-weight:600;">{p['completed']}/{p['total']} ({p['percent']}%)</span>
              </div>
              <div style="background:#2D3748;border-radius:4px;height:8px;overflow:hidden;">
                <div style="background:{bar_color};height:100%;width:{p['percent']}%;border-radius:4px;"></div>
              </div>
            </div>"""

        # Completed lessons list
        lessons_html = ""
        if u["completed_lessons"]:
            items = "".join(f"<li>{t}</li>" for t in u["completed_lessons"])
            lessons_html = f'<ul style="margin:4px 0;padding-left:20px;font-size:13px;color:#A0AEC0;">{items}</ul>'
        else:
            lessons_html = '<p style="font-size:13px;color:#718096;">Noch keine Lektionen abgeschlossen.</p>'

        # Achievements
        achs = " ".join(f'{a["icon"]} {a["name"]}' for a in u["achievements"])
        if not achs:
            achs = "Noch keine"

        last_active = u["last_activity"].strftime("%d.%m.%Y") if u["last_activity"] else "—"

        users_html += f"""
        <div style="background:#1A202C;border:1px solid #2D3748;border-radius:12px;padding:20px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="margin:0;color:#fff;font-size:18px;">{u['username']}</h3>
            <span style="font-size:13px;color:#718096;">Zuletzt aktiv: {last_active}</span>
          </div>
          <div style="display:flex;gap:24px;margin-bottom:16px;flex-wrap:wrap;">
            <div><span style="font-size:24px;font-weight:700;color:#00A76F;">{u['level']}</span> <span style="color:#A0AEC0;font-size:13px;">Level</span></div>
            <div><span style="font-size:24px;font-weight:700;color:#00B8D9;">{u['xp']:,}</span> <span style="color:#A0AEC0;font-size:13px;">XP</span></div>
            <div><span style="font-size:24px;font-weight:700;color:#FFC107;">{u['streak_days']}</span> <span style="color:#A0AEC0;font-size:13px;">Tage Streak</span></div>
            <div><span style="font-size:24px;font-weight:700;color:#8E33FF;">{u['completed_count']}</span> <span style="color:#A0AEC0;font-size:13px;">Lektionen</span></div>
          </div>
          <h4 style="margin:0 0 8px;color:#E2E8F0;font-size:14px;">Lernpfad-Fortschritt</h4>
          {paths_html}
          <h4 style="margin:12px 0 4px;color:#E2E8F0;font-size:14px;">Abgeschlossene Lektionen</h4>
          {lessons_html}
          <h4 style="margin:12px 0 4px;color:#E2E8F0;font-size:14px;">Achievements</h4>
          <p style="font-size:13px;color:#A0AEC0;margin:4px 0;">{achs}</p>
        </div>"""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#161C24;color:#fff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:32px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0 0 4px;color:#00A76F;font-size:24px;">AI Learning Hub</h1>
      <h2 style="margin:0;color:#E2E8F0;font-size:18px;font-weight:400;">Fortschrittsbericht — {date_str}</h2>
      <p style="color:#718096;font-size:13px;">Letzte {data['days']} Tage</p>
    </div>

    <div style="background:#1A202C;border:1px solid #2D3748;border-radius:12px;padding:20px;margin-bottom:24px;display:flex;justify-content:space-around;text-align:center;flex-wrap:wrap;gap:16px;">
      <div>
        <div style="font-size:32px;font-weight:700;color:#00A76F;">{data['user_count']}</div>
        <div style="font-size:13px;color:#A0AEC0;">Aktive User</div>
      </div>
      <div>
        <div style="font-size:32px;font-weight:700;color:#00B8D9;">{data['avg_level']}</div>
        <div style="font-size:13px;color:#A0AEC0;">Ø Level</div>
      </div>
      <div>
        <div style="font-size:32px;font-weight:700;color:#FFC107;">{data['total_completed']}</div>
        <div style="font-size:13px;color:#A0AEC0;">Lektionen abgeschlossen</div>
      </div>
    </div>

    {users_html}

    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #2D3748;">
      <p style="color:#718096;font-size:12px;margin:0;">Automatisch generiert vom AI Learning Hub</p>
    </div>
  </div>
</body>
</html>"""


def render_text(data):
    """Render report as plain text."""
    date_str = data["date"].strftime("%d.%m.%Y %H:%M")
    lines = [
        f"AI Learning Hub — Fortschrittsbericht ({date_str})",
        f"Letzte {data['days']} Tage",
        "=" * 60,
        f"Aktive User: {data['user_count']}",
        f"Durchschnittliches Level: {data['avg_level']}",
        f"Total abgeschlossene Lektionen: {data['total_completed']}",
        "",
    ]

    for u in data["users"]:
        lines.append("-" * 60)
        lines.append(f"{u['username']} — Level {u['level']}, {u['xp']:,} XP, {u['streak_days']} Tage Streak")
        last_active = u["last_activity"].strftime("%d.%m.%Y") if u["last_activity"] else "—"
        lines.append(f"Zuletzt aktiv: {last_active}")
        lines.append("")

        lines.append("Lernpfad-Fortschritt:")
        for p in u["path_progress"]:
            bar_len = p["percent"] // 5
            bar = "█" * bar_len + "░" * (20 - bar_len)
            lines.append(f"  {p['icon']} {p['title']}: [{bar}] {p['completed']}/{p['total']} ({p['percent']}%)")
        lines.append("")

        lines.append(f"Abgeschlossene Lektionen ({u['completed_count']}):")
        if u["completed_lessons"]:
            for t in u["completed_lessons"]:
                lines.append(f"  ✓ {t}")
        else:
            lines.append("  Noch keine.")

        lines.append(f"Offene Lektionen: {u['open_count']}")
        lines.append("")

        achs = ", ".join(f'{a["icon"]} {a["name"]}' for a in u["achievements"])
        lines.append(f"Achievements: {achs or 'Noch keine'}")
        lines.append("")

    lines.append("=" * 60)
    lines.append("Automatisch generiert vom AI Learning Hub")
    return "\n".join(lines)


class Command(BaseCommand):
    help = "Generate and email a progress report for all active users"

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Recipient email address")
        parser.add_argument("--days", type=int, default=7, help="Activity window in days (default: 7)")
        parser.add_argument("--format", choices=["html", "text"], default="html", help="Report format (default: html)")

    def handle(self, *args, **options):
        email = options["email"]
        days = options["days"]
        fmt = options["format"]

        self.stdout.write(f"Collecting data (last {days} days)...")
        data = collect_report_data(days)

        self.stdout.write(f"Found {data['user_count']} active user(s).")

        if fmt == "html":
            body = render_html(data)
        else:
            body = render_text(data)

        subject = f"AI Learning Hub — Fortschrittsbericht ({data['date'].strftime('%d.%m.%Y')})"

        self.stdout.write(f"Sending report to {email}...")
        send_mail(
            subject=subject,
            message=render_text(data),
            html_message=body if fmt == "html" else None,
            from_email=None,
            recipient_list=[email],
        )

        self.stdout.write(self.style.SUCCESS("Report sent!"))
