import os

from anthropic import Anthropic
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Achievement, UserAchievement
from lessons.models import Lesson

from .models import ChatMessage
from .serializers import ChatRequestSerializer

DEFAULT_SYSTEM_PROMPT = (
    "Du bist ein freundlicher AI-Tutor für eine Lernplattform über Künstliche Intelligenz. "
    "Hilf dem Lernenden Konzepte zu verstehen. Antworte auf Deutsch."
)


class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_message = serializer.validated_data["message"]
        lesson_id = serializer.validated_data.get("lesson_id")

        # 1. Determine system prompt
        lesson = None
        if lesson_id:
            try:
                lesson = Lesson.objects.get(id=lesson_id)
                system_prompt = lesson.ai_system_prompt
            except Lesson.DoesNotExist:
                return Response(
                    {"detail": "Lesson not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            system_prompt = DEFAULT_SYSTEM_PROMPT

        # 2. Load conversation history (last 20 messages for this user + lesson)
        history = ChatMessage.objects.filter(
            user=request.user,
            lesson=lesson,
        ).order_by("created_at")[:20]

        # 3. Build messages array
        messages = [{"role": msg.role, "content": msg.content} for msg in history]
        messages.append({"role": "user", "content": user_message})

        # 4. Call Anthropic API
        try:
            client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=system_prompt,
                messages=messages,
            )
            assistant_message = response.content[0].text
        except Exception as e:
            return Response(
                {"detail": f"AI service unavailable: {e}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # 5. Save messages
        ChatMessage.objects.create(
            user=request.user,
            lesson=lesson,
            role="user",
            content=user_message,
        )
        ChatMessage.objects.create(
            user=request.user,
            lesson=lesson,
            role="assistant",
            content=assistant_message,
        )

        # 6. Check first_chat achievement
        achievement_unlocked = None
        user_message_count = ChatMessage.objects.filter(
            user=request.user,
            role="user",
        ).count()

        if user_message_count == 1:
            try:
                achievement = Achievement.objects.get(slug="first_chat")
                _, created = UserAchievement.objects.get_or_create(
                    user=request.user,
                    achievement=achievement,
                )
                if created:
                    profile = request.user.profile
                    profile.xp += achievement.xp_reward
                    profile.save()
                    achievement_unlocked = {
                        "name": achievement.name,
                        "icon": achievement.icon,
                        "xp_reward": achievement.xp_reward,
                    }
            except Achievement.DoesNotExist:
                pass

        # 7. Return response
        return Response({
            "message": assistant_message,
            "achievement_unlocked": achievement_unlocked,
        })
