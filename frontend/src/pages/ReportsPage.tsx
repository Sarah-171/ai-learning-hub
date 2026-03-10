import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Assessment as AssessmentIcon, Add as AddIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getReports, generateReport } from '../api/endpoints';

interface ReportSummary {
  id: number;
  name: string;
  created_at: string;
  total_users: number;
  avg_level: number;
  total_completed_lessons: number;
  summary: string;
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports();
      setReports(res.data);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(`Reports konnten nicht geladen werden: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await generateReport();
      await fetchReports();
    } catch {
      setError('Report konnte nicht generiert werden.');
    } finally {
      setGenerating(false);
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Wird generiert...' : 'Neuen Report generieren'}
        </Button>
      </Box>

      <Alert severity="info" icon={<ScheduleIcon />} sx={{ mb: 2 }}>
        Reports werden automatisch täglich um 09:00 Uhr erstellt.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography color="text.secondary">
            Noch keine Reports vorhanden. Generiere deinen ersten Report.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Erstellt am</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Aktive User</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Ø Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Abgeschlossene Lektionen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => {
                const noActivity = report.summary.includes('Kein Training stattgefunden') || report.summary.includes('Keine Benutzer');
                return (
                  <TableRow
                    key={report.id}
                    hover
                    onClick={() => navigate(`/admin/reports/${report.id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{report.name}</TableCell>
                    <TableCell>{formatDate(report.created_at)}</TableCell>
                    <TableCell align="center">{report.total_users}</TableCell>
                    <TableCell align="center">{report.avg_level}</TableCell>
                    <TableCell align="center">{report.total_completed_lessons}</TableCell>
                    <TableCell>
                      {noActivity ? (
                        <Chip label="Kein Fortschritt" size="small" sx={{ bgcolor: 'rgba(145,158,171,0.16)', color: 'text.secondary', fontStyle: 'italic' }} />
                      ) : (
                        <Chip label="Aktivität" size="small" sx={{ bgcolor: 'rgba(0,167,111,0.16)', color: '#00A76F', fontWeight: 600 }} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </motion.div>
  );
}
