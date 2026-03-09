from django.urls import path

from . import views

urlpatterns = [
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("leaderboard/", views.LeaderboardView.as_view(), name="leaderboard"),
    path("achievements/", views.AchievementsView.as_view(), name="achievements"),
    path("admin/progress-report/", views.ProgressReportView.as_view(), name="progress-report"),
]
