import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Lock as LockIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getAchievements } from '../api/endpoints';

interface Achievement {
  slug: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  unlocked: boolean;
}

const fallbackData: Achievement[] = [
  { slug: 'first_lesson', name: 'Erste Lektion abgeschlossen', description: 'Du hast deine erste Lektion abgeschlossen!', icon: '🎓', xp_reward: 10, requirement_type: 'lessons_completed', requirement_value: 1, unlocked: true },
  { slug: 'first_chat', name: 'Erster AI Chat', description: 'Du hast deinen ersten AI Chat gestartet!', icon: '💬', xp_reward: 10, requirement_type: 'first_chat', requirement_value: 1, unlocked: true },
  { slug: 'three_streak', name: '3-Tage-Streak', description: 'Du hast 3 Tage am Stück gelernt!', icon: '🔥', xp_reward: 20, requirement_type: 'streak', requirement_value: 3, unlocked: false },
  { slug: 'all_basics', name: 'AI Grundlagen komplett', description: 'Du hast alle Lektionen in AI Grundlagen abgeschlossen!', icon: '🧠', xp_reward: 50, requirement_type: 'lessons_completed', requirement_value: 4, unlocked: false },
  { slug: 'xp_100', name: '100 XP gesammelt', description: 'Du hast insgesamt 100 XP gesammelt!', icon: '⭐', xp_reward: 25, requirement_type: 'xp_total', requirement_value: 100, unlocked: false },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAchievements()
      .then((res) => setAchievements(res.data))
      .catch(() => setAchievements(fallbackData))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
        Achievements
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Schalte Achievements frei, indem du Lektionen abschliesst und lernst.
      </Typography>
      <Chip
        label={`${unlocked} / ${achievements.length} freigeschaltet`}
        sx={{ mb: 4, fontWeight: 600, bgcolor: 'rgba(0,167,111,0.12)', color: 'primary.main' }}
      />

      <Grid container spacing={3}>
        {achievements.map((ach) => (
          <Grid key={ach.slug} size={{ xs: 12, sm: 6, md: 4 }}>
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  ...(ach.unlocked
                    ? { '&:hover': { transform: 'translateY(-2px)' } }
                    : { opacity: 0.5, filter: 'grayscale(0.5)' }),
                }}
              >
                {/* Status icon */}
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  {ach.unlocked ? (
                    <CheckIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  ) : (
                    <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  )}
                </Box>

                {/* Achievement icon */}
                <Typography sx={{ fontSize: 48, mb: 1.5, lineHeight: 1 }}>
                  {ach.icon}
                </Typography>

                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                  {ach.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {ach.description}
                </Typography>

                <Chip
                  label={`+${ach.xp_reward} XP`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: ach.unlocked ? 'rgba(0,167,111,0.12)' : 'rgba(145,158,171,0.12)',
                    color: ach.unlocked ? 'primary.main' : 'text.secondary',
                  }}
                />
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}
