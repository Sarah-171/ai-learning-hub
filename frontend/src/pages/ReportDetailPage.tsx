import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Info as InfoIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getReport } from '../api/endpoints';

interface PathProgress {
  path: string;
  progress_percent: number;
}

interface UserData {
  username: string;
  level: number;
  xp: number;
  streak_days: number;
  last_activity: string | null;
  completed_lessons: string[];
  open_lessons_count: number;
  paths_progress: PathProgress[];
  achievements: string[];
}

interface ReportDetail {
  id: number;
  name: string;
  created_at: string;
  total_users: number;
  avg_level: number;
  total_completed_lessons: number;
  summary: string;
  data: {
    users: UserData[];
    no_activity?: boolean;
  };
}

const XP_PER_LEVEL = 500;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getProgressColor(percent: number) {
  if (percent >= 100) return '#00A76F';
  if (percent >= 50) return '#00B8D9';
  return '#FFC107';
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getReport(Number(id));
        setReport(res.data);
      } catch {
        setError('Report konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !report) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Report nicht gefunden.'}
      </Alert>
    );
  }

  const users = report.data?.users ?? [];
  const noActivity = report.data?.no_activity === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconButton onClick={() => navigate('/admin/reports')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>
            {report.name}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
          Erstellt am {formatDate(report.created_at)}
        </Typography>
      </Box>

      {/* No activity banner */}
      {noActivity && (
        <Alert severity="warning" icon={<InfoIcon />} sx={{ mb: 3, fontSize: '1rem' }}>
          Kein Training stattgefunden und somit kein Fortschritt erzeugt.
        </Alert>
      )}

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h3" fontWeight={700} color="#00A76F">
              {report.total_users}
            </Typography>
            <Typography variant="body2" color="text.secondary">Aktive User</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h3" fontWeight={700} color="#00B8D9">
              {report.avg_level}
            </Typography>
            <Typography variant="body2" color="text.secondary">Ø Level</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h3" fontWeight={700} color="#FFC107">
              {report.total_completed_lessons}
            </Typography>
            <Typography variant="body2" color="text.secondary">Lektionen abgeschlossen</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* User cards — only show if there was activity */}
      <motion.div variants={container} initial="hidden" animate="show">
        {users.map((user) => {
          const xpInLevel = user.xp % XP_PER_LEVEL;
          const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100;

          return (
            <motion.div key={user.username} variants={item}>
              <Paper
                sx={{
                  p: 3,
                  mb: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid rgba(145,158,171,0.12)',
                }}
              >
                {/* User header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#00A76F',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {user.username.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {user.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Zuletzt aktiv: {user.last_activity ?? '—'}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Level ${user.level}`}
                    sx={{
                      bgcolor: 'rgba(0,167,111,0.16)',
                      color: '#00A76F',
                      fontWeight: 700,
                    }}
                  />
                </Box>

                {/* Stats row */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">XP</Typography>
                      <Typography variant="h6" fontWeight={700} color="#00B8D9">
                        {user.xp.toLocaleString('de-DE')}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={xpProgress}
                        sx={{
                          mt: 0.5,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(0,184,217,0.16)',
                          '& .MuiLinearProgress-bar': { bgcolor: '#00B8D9', borderRadius: 3 },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">Streak</Typography>
                    <Typography variant="h6" fontWeight={700} color="#FFC107">
                      🔥 {user.streak_days} Tage
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">Abgeschlossen</Typography>
                    <Typography variant="h6" fontWeight={700} color="#8E33FF">
                      {user.completed_lessons.length}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">Offen</Typography>
                    <Typography variant="h6" fontWeight={700} color="text.secondary">
                      {user.open_lessons_count}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Path progress */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Lernpfad-Fortschritt
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {user.paths_progress.map((pp) => (
                    <Box key={pp.path} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{pp.path}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {pp.progress_percent}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pp.progress_percent}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(145,158,171,0.16)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getProgressColor(pp.progress_percent),
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>

                {/* Completed lessons */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Abgeschlossene Lektionen
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {user.completed_lessons.length > 0 ? (
                    user.completed_lessons.map((lesson) => (
                      <Chip
                        key={lesson}
                        label={lesson}
                        size="small"
                        sx={{ bgcolor: 'rgba(0,167,111,0.12)', color: '#00A76F' }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Noch keine Lektionen abgeschlossen.
                    </Typography>
                  )}
                </Box>

                {/* Achievements */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Achievements
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {user.achievements.length > 0 ? (
                    user.achievements.map((ach) => (
                      <Chip
                        key={ach}
                        label={ach}
                        size="small"
                        sx={{ bgcolor: 'rgba(142,51,255,0.12)', color: '#8E33FF' }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Noch keine Achievements.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
