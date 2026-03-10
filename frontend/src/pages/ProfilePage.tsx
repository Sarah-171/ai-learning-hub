import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Chip,
  Typography,
  Avatar,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getProfiles } from '../api/endpoints';

interface ProfileSummary {
  username: string;
  xp: number;
  level: number;
  streak_days: number;
  avatar_color: string;
  completed_lessons_count: number;
  total_lessons_count: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfiles()
      .then((res) => setProfiles(res.data))
      .catch(() => setError('Profile konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', pt: 10 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight={700}>
          Profile
        </Typography>
      </Box>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Grid container spacing={3}>
          {profiles.map((profile) => (
            <Grid key={profile.username} size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div variants={itemVariants}>
                <Card
                  onClick={() => navigate(`/profile/${profile.username}`)}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: profile.avatar_color,
                        fontSize: 22,
                        fontWeight: 700,
                      }}
                    >
                      {profile.username.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {profile.username}
                      </Typography>
                      <Chip
                        label={`Level ${profile.level}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,167,111,0.16)',
                          color: '#00A76F',
                          fontWeight: 700,
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">XP</Typography>
                      <Typography variant="body1" fontWeight={700} color="#00B8D9">
                        {profile.xp.toLocaleString('de-DE')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Streak</Typography>
                      <Typography variant="body1" fontWeight={700} color="#FFC107">
                        {profile.streak_days} Tage
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Lektionen</Typography>
                      <Typography variant="body1" fontWeight={700} color="#00A76F">
                        {profile.completed_lessons_count}/{profile.total_lessons_count}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </motion.div>
  );
}
