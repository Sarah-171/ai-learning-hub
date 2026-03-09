import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../api/endpoints';

interface LeaderboardEntry {
  username: string;
  xp: number;
  level: number;
  avatar_color: string;
}

const medals = ['🥇', '🥈', '🥉'];

const fallbackData: LeaderboardEntry[] = [
  { username: 'Sarah K.', xp: 4820, level: 15, avatar_color: '#8E33FF' },
  { username: 'Max M.', xp: 4210, level: 13, avatar_color: '#00B8D9' },
  { username: 'Lisa W.', xp: 3890, level: 12, avatar_color: '#FF5630' },
  { username: 'Workshop User', xp: 2480, level: 8, avatar_color: '#00A76F' },
  { username: 'Tom B.', xp: 2100, level: 7, avatar_color: '#FFC107' },
  { username: 'Anna S.', xp: 1850, level: 6, avatar_color: '#8E33FF' },
  { username: 'Jan P.', xp: 1420, level: 5, avatar_color: '#00B8D9' },
  { username: 'Marie L.', xp: 980, level: 3, avatar_color: '#FF5630' },
  { username: 'Lukas H.', xp: 540, level: 2, avatar_color: '#FFC107' },
  { username: 'Sophie R.', xp: 120, level: 1, avatar_color: '#00A76F' },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((res) => {
        setEntries(res.data.length > 1 ? res.data : fallbackData);
      })
      .catch(() => setEntries(fallbackData))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <TrophyIcon sx={{ color: '#FFC107', fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>
          Leaderboard
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Die besten Lernenden nach Erfahrungspunkten.
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>Rang</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Level</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>XP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrentUser = entry.username === 'Workshop User' || entry.username === 'admin';

                return (
                  <TableRow
                    key={entry.username}
                    sx={{
                      ...(isCurrentUser && { bgcolor: 'rgba(0,167,111,0.08)' }),
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight={700} sx={{ fontSize: rank <= 3 ? 24 : 16 }}>
                        {rank <= 3 ? medals[rank - 1] : `#${rank}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: entry.avatar_color,
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          {entry.username.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={isCurrentUser ? 700 : 500}>
                            {entry.username}{isCurrentUser ? ' (Du)' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {entry.level}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {entry.xp.toLocaleString()} XP
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </motion.div>
  );
}
