from django.urls import path

from . import views

urlpatterns = [
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("profiles/", views.ProfileListView.as_view(), name="profile-list"),
    path("profiles/<str:username>/", views.ProfileDetailByUsernameView.as_view(), name="profile-detail"),
    path("leaderboard/", views.LeaderboardView.as_view(), name="leaderboard"),
    path("achievements/", views.AchievementsView.as_view(), name="achievements"),
    path("reports/", views.ReportListView.as_view(), name="report-list"),
    path("reports/generate/", views.ReportGenerateView.as_view(), name="report-generate"),
    path("reports/<int:pk>/", views.ReportDetailView.as_view(), name="report-detail"),
]
