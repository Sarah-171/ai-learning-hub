import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Grid,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as LevelIcon,
  Star as XPIcon,
  LocalFireDepartment as StreakIcon,
  EmojiEvents as AchievementsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getProfile, getAchievements } from '../api/endpoints';

interface Profile {
  username: string;
  xp: number;
  level: number;
  streak_days: number;
  avatar_color: string;
}

const fallbackProfile: Profile = {
  username: 'Workshop User',
  xp: 2480,
  level: 8,
  streak_days: 7,
  avatar_color: '#00A76F',
};

const XP_PER_LEVEL = 500;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievementCount, setAchievementCount] = useState({ unlocked: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfile().catch(() => ({ data: fallbackProfile })),
      getAchievements().catch(() => ({ data: [] })),
    ])
      .then(([profileRes, achRes]) => {
        const p = profileRes.data.username ? profileRes.data : fallbackProfile;
        setProfile(p);
        const achs = achRes.data as { unlocked: boolean }[];
        setAchievementCount({
          unlocked: achs.filter((a) => a.unlocked).length,
          total: achs.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const xpInLevel = profile.xp % XP_PER_LEVEL;
  const levelProgress = (xpInLevel / XP_PER_LEVEL) * 100;

  const stats = [
    { icon: <LevelIcon />, label: 'Level', value: profile.level, color: '#00A76F' },
    { icon: <XPIcon />, label: 'Erfahrungspunkte', value: `${profile.xp.toLocaleString()} XP`, color: '#00B8D9' },
    { icon: <StreakIcon />, label: 'Tages-Streak', value: `${profile.streak_days} Tage`, color: '#FFC107' },
    { icon: <AchievementsIcon />, label: 'Achievements', value: `${achievementCount.unlocked} / ${achievementCount.total}`, color: '#8E33FF' },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Profile Header */}
      <motion.div variants={itemVariants}>
        <Card sx={{ p: 4, mb: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: profile.avatar_color,
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {profile.username.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h4" fontWeight={700}>
              {profile.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Level {profile.level} — {profile.xp.toLocaleString()} XP
            </Typography>

            {/* XP Progress to next level */}
            <Box sx={{ maxWidth: 400 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Fortschritt zu Level {profile.level + 1}
                </Typography>
                <Typography variant="caption" fontWeight={600} color="primary.main">
                  {xpInLevel} / {XP_PER_LEVEL} XP
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={levelProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(145,158,171,0.16)',
                  '& .MuiLinearProgress-bar': { borderRadius: 4 },
                }}
              />
            </Box>
          </Box>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${stat.color}1A`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}
