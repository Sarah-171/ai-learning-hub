from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LearningPath, Lesson, LessonProgress
from .serializers import LearningPathListSerializer, LessonSerializer


class LearningPathListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        paths = LearningPath.objects.annotate(lesson_count=Count("lessons"))
        serializer = LearningPathListSerializer(paths, many=True, context={"request": request})
        return Response(serializer.data)


class LearningPathDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        path = get_object_or_404(LearningPath, slug=slug)
        lessons = path.lessons.all()
        path_serializer = LearningPathListSerializer(path, context={"request": request})
        lesson_serializer = LessonSerializer(lessons, many=True, context={"request": request})
        data = path_serializer.data
        data["lessons"] = lesson_serializer.data
        return Response(data)


class LessonDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        lesson = get_object_or_404(Lesson, slug=slug)
        serializer = LessonSerializer(lesson, context={"request": request})
        return Response(serializer.data)


class LessonCompleteView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, slug):
        # Dev fallback: use first user if anonymous
        user = request.user
        if not user.is_authenticated:
            from django.contrib.auth import get_user_model
            user = get_user_model().objects.first()

        lesson = get_object_or_404(Lesson, slug=slug)
        progress, created = LessonProgress.objects.get_or_create(
            user=user,
            lesson=lesson,
        )

        if progress.completed:
            return Response({"detail": "Already completed"}, status=status.HTTP_200_OK)

        progress.completed = True
        progress.completed_at = timezone.now()
        progress.save()

        # Award XP
        profile = user.profile
        profile.xp += lesson.xp_reward
        profile.save()

        return Response({
            "detail": "Lesson completed",
            "xp_earned": lesson.xp_reward,
            "total_xp": profile.xp,
        })
