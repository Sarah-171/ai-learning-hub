import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Grid,
} from '@mui/material';
import {
  TrendingUp as LevelIcon,
  Star as XPIcon,
  LocalFireDepartment as StreakIcon,
  Flag as MissionIcon,
  Psychology as AIIcon,
  DataObject as DataIcon,
  SmartToy as MLIcon,
  RocketLaunch as RocketIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';

// --- Dummy Data ---

const stats = [
  { icon: <LevelIcon />, title: 'Level', value: 12, color: '#00A76F' },
  { icon: <XPIcon />, title: 'Erfahrungspunkte', value: 2480, suffix: 'XP', color: '#00B8D9' },
  { icon: <StreakIcon />, title: 'Tages-Streak', value: 7, suffix: 'Tage', color: '#FFC107' },
  { icon: <MissionIcon />, title: 'Missionen abgeschlossen', value: 34, color: '#8E33FF' },
];

const learningPaths = [
  {
    icon: <AIIcon sx={{ fontSize: 32 }} />,
    title: 'AI Grundlagen',
    lessons: 12,
    completed: 10,
    level: 'Einsteiger',
    levelColor: '#00A76F',
  },
  {
    icon: <DataIcon sx={{ fontSize: 32 }} />,
    title: 'Prompt Engineering',
    lessons: 8,
    completed: 5,
    level: 'Mittel',
    levelColor: '#FFC107',
  },
  {
    icon: <MLIcon sx={{ fontSize: 32 }} />,
    title: 'Machine Learning',
    lessons: 15,
    completed: 3,
    level: 'Fortgeschritten',
    levelColor: '#FF5630',
  },
];

const leaderboard = [
  { rank: 1, name: 'Sarah K.', xp: 4820, avatar: 'S' },
  { rank: 2, name: 'Max M.', xp: 4210, avatar: 'M' },
  { rank: 3, name: 'Lisa W.', xp: 3890, avatar: 'L' },
  { rank: 4, name: 'Du', xp: 2480, avatar: 'D' },
  { rank: 5, name: 'Tom B.', xp: 2100, avatar: 'T' },
];

const medals = ['🥇', '🥈', '🥉'];

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// --- Component ---

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Willkommen zurück! 👋
      </Typography>

      {/* Zone 1 — StatCards */}
      <motion.div variants={containerVariants}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat) => (
            <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Zone 2 — Lernpfad-Vorschau */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Deine Lernpfade
      </Typography>
      <motion.div variants={containerVariants}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {learningPaths.map((path) => (
            <Grid key={path.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                  onClick={() => navigate('/learn')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${path.levelColor}1A`,
                        color: path.levelColor,
                      }}
                    >
                      {path.icon}
                    </Box>
                    <Chip
                      label={path.level}
                      size="small"
                      sx={{
                        bgcolor: `${path.levelColor}1A`,
                        color: path.levelColor,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                    {path.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {path.completed} / {path.lessons} Lektionen
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(path.completed / path.lessons) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(145,158,171,0.16)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: path.levelColor,
                      },
                    }}
                  />
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Zone 3 — Leaderboard + Quick Action */}
      <Grid container spacing={3}>
        {/* Leaderboard */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div variants={itemVariants}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Leaderboard
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rang</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">XP</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.map((user) => (
                      <TableRow
                        key={user.rank}
                        sx={{
                          ...(user.name === 'Du' && {
                            bgcolor: 'rgba(0,167,111,0.08)',
                          }),
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {user.rank <= 3 ? medals[user.rank - 1] : `#${user.rank}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: 14,
                                bgcolor: user.name === 'Du' ? 'primary.main' : 'grey.700',
                              }}
                            >
                              {user.avatar}
                            </Avatar>
                            <Typography variant="body2" fontWeight={user.name === 'Du' ? 700 : 400}>
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {user.xp.toLocaleString()} XP
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Action */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(0,167,111,0.12) 0%, rgba(142,51,255,0.12) 100%)',
              }}
            >
              <Box>
                <Box sx={{ mb: 2 }}>
                  <RocketIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Weiter lernen
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Setze deinen Lernpfad fort und sammle XP, um im Leaderboard aufzusteigen.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => navigate('/learn')}
                sx={{ fontWeight: 600 }}
              >
                Lernpfad starten
              </Button>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}
