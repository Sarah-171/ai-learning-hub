from rest_framework import serializers

from .models import LearningPath, Lesson, LessonProgress


class LearningPathListSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(read_only=True)
    user_progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = LearningPath
        fields = ("slug", "title", "description", "icon", "difficulty", "lesson_count", "user_progress_percent")

    def get_user_progress_percent(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        total = obj.lessons.count()
        if total == 0:
            return 0
        completed = LessonProgress.objects.filter(
            user=request.user,
            lesson__path=obj,
            completed=True,
        ).count()
        return round((completed / total) * 100)


class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ("slug", "title", "description", "content", "ai_system_prompt", "xp_reward", "is_completed")

    def get_is_completed(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return LessonProgress.objects.filter(
            user=request.user,
            lesson=obj,
            completed=True,
        ).exists()
