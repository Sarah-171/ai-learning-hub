from django.core.management.base import BaseCommand

from core.models import Achievement
from lessons.models import LearningPath, Lesson

PATHS_DATA = [
    {
        "slug": "ai-grundlagen",
        "title": "AI Grundlagen",
        "description": "Verstehe die Basis von künstlicher Intelligenz: Geschichte, Konzepte und Anwendungsbereiche.",
        "icon": "\U0001f9e0",
        "difficulty": "beginner",
        "order": 1,
        "lessons": [
            {
                "slug": "was-ist-ki",
                "title": "Was ist Künstliche Intelligenz?",
                "content": "**Künstliche Intelligenz** umfasst Systeme, die menschenähnliche Aufgaben ausführen können. In dieser Lektion lernst du die grundlegenden Definitionen und Kategorien von AI kennen.",
                "ai_system_prompt": "Du bist ein freundlicher AI-Tutor. Erkläre KI-Konzepte einfach mit Alltags-Analogien. Der Lernende ist Anfänger.",
            },
            {
                "slug": "wie-funktionieren-llms",
                "title": "Wie funktionieren Large Language Models?",
                "content": "**Large Language Models** sind neuronale Netze, die auf riesigen Textmengen trainiert wurden. Sie sagen das nächste Wort vorher — ähnlich wie die Autokorrektur auf deinem Handy, nur viel leistungsfähiger.",
                "ai_system_prompt": "Erkläre LLMs verständlich. Nutze Beispiele wie Textvorhersage auf dem Handy.",
            },
            {
                "slug": "tokens-kontext-temperatur",
                "title": "Tokens, Kontext und Temperatur",
                "content": "**Tokens** sind die Bausteine, in die Text zerlegt wird. Der **Kontext** bestimmt, wie viel ein Modell gleichzeitig verarbeiten kann. Die **Temperatur** steuert die Kreativität der Antworten.",
                "ai_system_prompt": "Erkläre technische LLM-Begriffe einfach. Verwende praktische Beispiele.",
            },
            {
                "slug": "dein-erster-prompt",
                "title": "Dein erster Prompt",
                "content": "Zeit für die Praxis! In dieser Lektion schreibst du deinen **ersten Prompt** und lernst, wie du klare und effektive Anweisungen an ein AI-Modell formulierst.",
                "ai_system_prompt": "Hilf dem Lernenden seinen ersten Prompt zu schreiben. Gib praktische Tipps.",
            },
        ],
    },
    {
        "slug": "prompt-engineering",
        "title": "Prompt Engineering",
        "description": "Lerne, wie du durch gezielte Prompts bessere Ergebnisse von AI-Modellen erzielst.",
        "icon": "\u270d\ufe0f",
        "difficulty": "intermediate",
        "order": 2,
        "lessons": [
            {
                "slug": "klare-anweisungen",
                "title": "Klare Anweisungen formulieren",
                "content": "Der wichtigste Skill im Prompt Engineering: **Klarheit**. Lerne, wie du Anweisungen so formulierst, dass das Modell genau versteht, was du willst.",
                "ai_system_prompt": "Lehre Prompt-Techniken für klare Anweisungen. Zeige Vorher/Nachher-Beispiele.",
            },
            {
                "slug": "few-shot-prompting",
                "title": "Few-Shot Prompting",
                "content": "Mit **Few-Shot Prompting** gibst du dem Modell Beispiele, an denen es sich orientieren kann. Das verbessert die Qualität und Konsistenz der Ausgaben erheblich.",
                "ai_system_prompt": "Erkläre Few-Shot Prompting mit konkreten Beispielen.",
            },
            {
                "slug": "chain-of-thought",
                "title": "Chain-of-Thought",
                "content": "**Chain-of-Thought Prompting** bringt das Modell dazu, Schritt für Schritt zu denken. Das verbessert die Ergebnisse bei komplexen Aufgaben wie Mathe oder Logik deutlich.",
                "ai_system_prompt": "Erkläre Chain-of-Thought Prompting. Zeige wie schrittweises Denken die Ergebnisse verbessert.",
            },
        ],
    },
    {
        "slug": "agentic-workflows",
        "title": "Agentic Workflows",
        "description": "Baue autonome AI-Systeme mit Tool Use, Multi-Agent Architekturen und MCP.",
        "icon": "\U0001f916",
        "difficulty": "advanced",
        "order": 3,
        "lessons": [
            {
                "slug": "was-sind-ai-agents",
                "title": "Was sind AI Agents?",
                "content": "**AI Agents** sind Systeme, die selbstständig Aufgaben planen und ausführen können. Sie kombinieren LLMs mit Tools und Entscheidungslogik.",
                "ai_system_prompt": "Erkläre AI Agents und autonome Systeme. Der Lernende hat Prompt-Engineering Grundlagen.",
            },
            {
                "slug": "tool-use-function-calling",
                "title": "Tool Use und Function Calling",
                "content": "Mit **Function Calling** können LLMs externe Tools aufrufen — APIs, Datenbanken oder Code ausführen. Das macht sie von reinen Textgeneratoren zu handlungsfähigen Systemen.",
                "ai_system_prompt": "Erkläre wie LLMs Tools nutzen können. Zeige Function Calling Beispiele.",
            },
            {
                "slug": "multi-agent-systeme",
                "title": "Multi-Agent Systeme",
                "content": "In **Multi-Agent Systemen** arbeiten mehrere spezialisierte Agents zusammen. Jeder Agent hat eine Rolle — ähnlich wie ein Team aus Experten.",
                "ai_system_prompt": "Erkläre Multi-Agent Architekturen mit praktischen Anwendungsfällen.",
            },
            {
                "slug": "mcp-model-context-protocol",
                "title": "MCP — Model Context Protocol",
                "content": "Das **Model Context Protocol** standardisiert, wie AI-Modelle mit externen Datenquellen und Tools kommunizieren. Es ist wie USB für AI-Integrationen.",
                "ai_system_prompt": "Erkläre MCP und wie es AI-Tools standardisiert verbindet.",
            },
            {
                "slug": "eigene-workflows-bauen",
                "title": "Eigene Workflows bauen",
                "content": "Jetzt bist du dran: Plane und baue deinen **eigenen AI-Workflow**. Kombiniere Agents, Tools und Prompts zu einem funktionierenden System.",
                "ai_system_prompt": "Hilf dem Lernenden eigene AI-Workflows zu planen und umzusetzen.",
            },
        ],
    },
]

ACHIEVEMENTS_DATA = [
    {
        "slug": "first_lesson",
        "name": "Erste Lektion abgeschlossen",
        "description": "Du hast deine erste Lektion abgeschlossen!",
        "icon": "\U0001f393",
        "xp_reward": 10,
        "requirement_type": "lessons_completed",
        "requirement_value": 1,
    },
    {
        "slug": "first_chat",
        "name": "Erster AI Chat",
        "description": "Du hast deinen ersten AI Chat gestartet!",
        "icon": "\U0001f4ac",
        "xp_reward": 10,
        "requirement_type": "first_chat",
        "requirement_value": 1,
    },
    {
        "slug": "three_streak",
        "name": "3-Tage-Streak",
        "description": "Du hast 3 Tage am Stück gelernt!",
        "icon": "\U0001f525",
        "xp_reward": 20,
        "requirement_type": "streak",
        "requirement_value": 3,
    },
    {
        "slug": "all_basics",
        "name": "AI Grundlagen komplett",
        "description": "Du hast alle Lektionen in AI Grundlagen abgeschlossen!",
        "icon": "\U0001f9e0",
        "xp_reward": 50,
        "requirement_type": "lessons_completed",
        "requirement_value": 4,
    },
    {
        "slug": "xp_100",
        "name": "100 XP gesammelt",
        "description": "Du hast insgesamt 100 XP gesammelt!",
        "icon": "\u2b50",
        "xp_reward": 25,
        "requirement_type": "xp_total",
        "requirement_value": 100,
    },
]


class Command(BaseCommand):
    help = "Seed learning paths, lessons, and achievements"

    def handle(self, *args, **options):
        for path_data in PATHS_DATA:
            lessons_data = path_data.pop("lessons")
            path, created = LearningPath.objects.get_or_create(
                slug=path_data["slug"],
                defaults=path_data,
            )
            action = "Created" if created else "Already exists"
            self.stdout.write(f"  {action}: Path '{path.title}'")

            for i, lesson_data in enumerate(lessons_data):
                lesson_data["order"] = i + 1
                lesson_data["xp_reward"] = 10
                _, l_created = Lesson.objects.get_or_create(
                    path=path,
                    slug=lesson_data["slug"],
                    defaults=lesson_data,
                )
                l_action = "Created" if l_created else "Already exists"
                self.stdout.write(f"    {l_action}: Lesson '{lesson_data['title']}'")

            # Restore lessons key for idempotency on re-run
            path_data["lessons"] = lessons_data

        self.stdout.write("")
        for ach_data in ACHIEVEMENTS_DATA:
            _, created = Achievement.objects.get_or_create(
                slug=ach_data["slug"],
                defaults=ach_data,
            )
            action = "Created" if created else "Already exists"
            self.stdout.write(f"  {action}: Achievement '{ach_data['name']}'")

        self.stdout.write(self.style.SUCCESS("\nSeed complete!"))
