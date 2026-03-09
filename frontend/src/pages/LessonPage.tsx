import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPath, getLesson, completeLesson } from '../api/endpoints';
import ChatPanel from '../components/ChatPanel';

interface LessonData {
  slug: string;
  title: string;
  description: string;
  content: string;
  ai_system_prompt: string;
  xp_reward: number;
  is_completed: boolean;
}

interface PathData {
  slug: string;
  title: string;
  lessons: { slug: string; title: string }[];
}

export default function LessonPage() {
  const { pathSlug, lessonSlug } = useParams<{ pathSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [lessonId, setLessonId] = useState<number | undefined>();
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonSlug || !pathSlug) return;

    setLoading(true);
    setError(null);

    Promise.all([getLesson(lessonSlug), getPath(pathSlug)])
      .then(([lessonRes, pathRes]) => {
        setLesson(lessonRes.data);
        setPathData(pathRes.data);
        setCompleted(lessonRes.data.is_completed);
        // Find lesson id from path lessons list index
        const idx = pathRes.data.lessons.findIndex(
          (l: { slug: string }) => l.slug === lessonSlug,
        );
        if (idx !== -1) setLessonId(idx + 1);
      })
      .catch(() => setError('Lektion konnte nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, [lessonSlug, pathSlug]);

  const handleComplete = async () => {
    if (!lessonSlug || completed) return;
    setCompleting(true);
    try {
      await completeLesson(lessonSlug);
      setCompleted(true);
    } catch {
      // ignore
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !lesson) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'Lektion nicht gefunden.'}</Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          height: { md: 'calc(100vh - 140px)' },
        }}
      >
        {/* Left side — Lesson content (60%) */}
        <Box sx={{ flex: { md: '0 0 60%' }, overflow: 'auto' }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              underline="hover"
              color="text.secondary"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/learn')}
            >
              Lernpfade
            </Link>
            <Link
              underline="hover"
              color="text.secondary"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/learn')}
            >
              {pathData?.title}
            </Link>
            <Typography color="text.primary" variant="body2">
              {lesson.title}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
            {lesson.title}
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            {lesson.content}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleComplete}
            disabled={completed || completing}
            startIcon={completed ? <CheckIcon /> : undefined}
            sx={{
              fontWeight: 600,
              ...(completed && {
                bgcolor: 'success.main',
                '&.Mui-disabled': { bgcolor: 'success.main', color: '#fff' },
              }),
            }}
          >
            {completing
              ? 'Wird abgeschlossen...'
              : completed
                ? 'Abgeschlossen'
                : `Lektion abschliessen (+${lesson.xp_reward} XP)`}
          </Button>
        </Box>

        {/* Right side — Chat (40%) */}
        <Card
          sx={{
            flex: { md: '0 0 38%' },
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 500, md: 'auto' },
          }}
        >
          <ChatPanel
            lessonId={lessonId}
            title="AI Tutor"
            welcomeMessage={`Willkommen zur Lektion "${lesson.title}"! Stell mir Fragen zum Thema — ich helfe dir gerne.`}
          />
        </Card>
      </Box>
    </motion.div>
  );
}
