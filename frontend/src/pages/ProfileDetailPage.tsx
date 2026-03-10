import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Chip,
  Typography,
  Avatar,
  Grid,
  LinearProgress,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Star as XPIcon,
  LocalFireDepartment as StreakIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getProfileByUsername } from '../api/endpoints';

interface AchievementInfo {
  icon: string;
  name: string;
  unlocked_at: string;
}

interface ProfileDetail {
  username: string;
  xp: number;
  level: number;
  streak_days: number;
  avatar_color: string;
  completed_lessons_count: number;
  total_lessons_count: number;
  achievements: AchievementInfo[];
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    getProfileByUsername(username)
      .then((res) => setProfile(res.data))
      .catch(() => setError('Profil konnte nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ textAlign: 'center', pt: 10 }}>
        <Typography color="error">{error || 'Profil nicht gefunden.'}</Typography>
      </Box>
    );
  }

  const xpInLevel = profile.xp % 100;
  const levelProgress = xpInLevel;

  const stats = [
    { icon: <XPIcon />, label: 'Total XP', value: profile.xp.toLocaleString('de-DE'), color: '#00B8D9' },
    { icon: <StreakIcon />, label: 'Streak', value: `${profile.streak_days} Tage`, color: '#FFC107' },
    { icon: <CompletedIcon />, label: 'Abgeschlossene Lektionen', value: `${profile.completed_lessons_count} / ${profile.total_lessons_count}`, color: '#00A76F' },
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/profile')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          Profil
        </Typography>
      </Box>

      {/* Profile Card */}
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
            {profile.username.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {profile.username}
              </Typography>
              <Chip
                label={`Level ${profile.level}`}
                sx={{
                  bgcolor: 'rgba(0,167,111,0.16)',
                  color: '#00A76F',
                  fontWeight: 700,
                }}
              />
            </Box>

            {/* XP Progress */}
            <Box sx={{ maxWidth: 400 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Fortschritt zu Level {profile.level + 1}
                </Typography>
                <Typography variant="caption" fontWeight={600} color="primary.main">
                  {xpInLevel} / 100 XP zum nächsten Level
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
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

      {/* Achievements */}
      <motion.div variants={itemVariants}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Achievements
          </Typography>
          {profile.achievements.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {profile.achievements.map((ach) => (
                <Box
                  key={ach.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(142,51,255,0.08)',
                    border: '1px solid rgba(142,51,255,0.16)',
                  }}
                >
                  <Typography fontSize={28}>{ach.icon}</Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {ach.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(ach.unlocked_at)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Noch keine Achievements freigeschaltet.
            </Typography>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
