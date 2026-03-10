import logging
from datetime import date, datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from django.core.management import call_command
from django_apscheduler.jobstores import DjangoJobStore

logger = logging.getLogger(__name__)


def generate_daily_report():
    """Erstellt den Fortschrittsreport. Braucht keinen Login, keinen Browser, keine GUI."""
    try:
        call_command("progress_report")
        logger.info("Fortschrittsreport automatisch erstellt.")
    except Exception as e:
        logger.error(f"Fehler beim automatischen Report: {e}")


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_jobstore(DjangoJobStore(), "default")

    # Täglicher Report um 09:00 Uhr
    scheduler.add_job(
        generate_daily_report,
        trigger=CronTrigger(hour=9, minute=0),
        id="daily_progress_report",
        max_instances=1,
        replace_existing=True,
    )
    logger.info("Scheduler: Täglicher Report um 09:00 Uhr registriert.")

    # Einmaliger Report heute um 09:30 Uhr (nur wenn 09:30 noch nicht vorbei ist)
    today_0930 = datetime.combine(date.today(), datetime.strptime("09:30", "%H:%M").time())
    if datetime.now() < today_0930:
        scheduler.add_job(
            generate_daily_report,
            trigger=DateTrigger(run_date=today_0930),
            id="onetime_report_today",
            max_instances=1,
            replace_existing=True,
        )
        logger.info("Scheduler: Einmaliger Report heute um 09:30 registriert.")
    else:
        logger.info("Scheduler: 09:30 ist bereits vorbei, einmaliger Job wird übersprungen.")

    scheduler.start()
    logger.info("Scheduler gestartet.")
