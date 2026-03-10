import os

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import core.signals  # noqa: F401

        # Only start scheduler in the main process, not in the reloader
        if os.environ.get('RUN_MAIN') == 'true':
            from core.scheduler import start_scheduler
            start_scheduler()
