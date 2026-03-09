from django.contrib import admin

from .models import LearningPath, Lesson, LessonProgress


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ("icon", "title", "difficulty", "order")
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "path", "xp_reward", "order")


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "lesson", "completed", "completed_at")
