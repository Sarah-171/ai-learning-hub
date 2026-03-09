import { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Typography,
  LinearProgress,
  Grid,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Psychology as AIIcon,
  DataObject as DataIcon,
  SmartToy as MLIcon,
  Visibility as VisionIcon,
  Translate as NLPIcon,
  Gavel as EthicsIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  AccessTime as TimeIcon,
  MenuBook as LessonsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- Types ---

interface Lesson {
  slug: string;
  title: string;
  completed: boolean;
}

interface LearningPath {
  id: number;
  slug: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  lessons: Lesson[];
  level: string;
  levelColor: string;
  duration: string;
}

// --- Dummy Data ---

const learningPaths: LearningPath[] = [
  {
    id: 1,
    slug: 'ai-grundlagen',
    icon: <AIIcon sx={{ fontSize: 32 }} />,
    title: 'AI Grundlagen',
    description: 'Verstehe die Basis von künstlicher Intelligenz: Geschichte, Konzepte und Anwendungsbereiche.',
    lessons: [
      { slug: 'was-ist-ki', title: 'Was ist Künstliche Intelligenz?', completed: true },
      { slug: 'wie-funktionieren-llms', title: 'Wie funktionieren Large Language Models?', completed: true },
      { slug: 'tokens-kontext-temperatur', title: 'Tokens, Kontext und Temperatur', completed: false },
      { slug: 'dein-erster-prompt', title: 'Dein erster Prompt', completed: false },
    ],
    level: 'Einsteiger',
    levelColor: '#00A76F',
    duration: '3 Std.',
  },
  {
    id: 2,
    slug: 'prompt-engineering',
    icon: <DataIcon sx={{ fontSize: 32 }} />,
    title: 'Prompt Engineering',
    description: 'Lerne, wie du durch gezielte Prompts bessere Ergebnisse von AI-Modellen erzielst.',
    lessons: [
      { slug: 'klare-anweisungen', title: 'Klare Anweisungen formulieren', completed: true },
      { slug: 'few-shot-prompting', title: 'Few-Shot Prompting', completed: true },
      { slug: 'chain-of-thought', title: 'Chain-of-Thought', completed: false },
    ],
    level: 'Mittel',
    levelColor: '#FFC107',
    duration: '5 Std.',
  },
  {
    id: 3,
    slug: 'agentic-workflows',
    icon: <MLIcon sx={{ fontSize: 32 }} />,
    title: 'Agentic Workflows',
    description: 'Baue autonome AI-Systeme mit Tool Use, Multi-Agent Architekturen und MCP.',
    lessons: [
      { slug: 'was-sind-ai-agents', title: 'Was sind AI Agents?', completed: true },
      { slug: 'tool-use-function-calling', title: 'Tool Use und Function Calling', completed: false },
      { slug: 'multi-agent-systeme', title: 'Multi-Agent Systeme', completed: false },
      { slug: 'mcp-model-context-protocol', title: 'MCP — Model Context Protocol', completed: false },
      { slug: 'eigene-workflows-bauen', title: 'Eigene Workflows bauen', completed: false },
    ],
    level: 'Fortgeschritten',
    levelColor: '#FF5630',
    duration: '8 Std.',
  },
  {
    id: 4,
    slug: 'computer-vision',
    icon: <VisionIcon sx={{ fontSize: 32 }} />,
    title: 'Computer Vision',
    description: 'Erfahre, wie Maschinen Bilder und Videos verstehen und interpretieren.',
    lessons: [
      { slug: 'einfuehrung-cv', title: 'Einführung in CV', completed: true },
      { slug: 'bildverarbeitung', title: 'Bildverarbeitung Basics', completed: false },
      { slug: 'cnn', title: 'Convolutional Neural Networks', completed: false },
      { slug: 'objekterkennung', title: 'Objekterkennung', completed: false },
    ],
    level: 'Fortgeschritten',
    levelColor: '#FF5630',
    duration: '6 Std.',
  },
  {
    id: 5,
    slug: 'nlp',
    icon: <NLPIcon sx={{ fontSize: 32 }} />,
    title: 'Natural Language Processing',
    description: 'Verstehe, wie AI Sprache verarbeitet — von Tokenisierung bis zu Transformern.',
    lessons: [
      { slug: 'nlp-grundlagen', title: 'NLP Grundlagen', completed: true },
      { slug: 'tokenisierung-embeddings', title: 'Tokenisierung & Embeddings', completed: true },
      { slug: 'sentiment-analysis', title: 'Sentiment Analysis', completed: false },
      { slug: 'transformer-architektur', title: 'Transformer-Architektur', completed: false },
    ],
    level: 'Mittel',
    levelColor: '#FFC107',
    duration: '6 Std.',
  },
  {
    id: 6,
    slug: 'ethik-in-ai',
    icon: <EthicsIcon sx={{ fontSize: 32 }} />,
    title: 'Ethik in AI',
    description: 'Setze dich mit Bias, Fairness, Transparenz und verantwortungsvoller AI-Nutzung auseinander.',
    lessons: [
      { slug: 'warum-ai-ethik', title: 'Warum AI-Ethik?', completed: true },
      { slug: 'bias-in-daten', title: 'Bias in Daten & Modellen', completed: true },
      { slug: 'fairness-metriken', title: 'Fairness-Metriken', completed: true },
      { slug: 'transparenz', title: 'Transparenz & Erklärbarkeit', completed: false },
      { slug: 'regulierung', title: 'Regulierung & Gesetze', completed: false },
    ],
    level: 'Einsteiger',
    levelColor: '#00A76F',
    duration: '2 Std.',
  },
];

const filterOptions = ['Alle', 'Einsteiger', 'Mittel', 'Fortgeschritten'];

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

export default function LearningPathsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Alle');
  const [search, setSearch] = useState('');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);

  const filtered = learningPaths.filter((p) => {
    const matchesFilter = filter === 'Alle' || p.level === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Zone 1 — Header + Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          Lernpfade
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Wähle einen Lernpfad und starte deine AI-Reise.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Lernpfad suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 240 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {filterOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                clickable
                onClick={() => setFilter(opt)}
                variant={filter === opt ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  ...(filter === opt && {
                    bgcolor: 'primary.main',
                    color: '#fff',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }),
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Zone 2 — Lernpfad-Karten */}
      <motion.div variants={containerVariants}>
        <Grid container spacing={3}>
          {filtered.map((path) => {
            const completed = path.lessons.filter((l) => l.completed).length;
            const progress = (completed / path.lessons.length) * 100;

            return (
              <Grid key={path.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) => theme.shadows[8],
                      },
                    }}
                    onClick={() => setSelectedPath(path)}
                  >
                    {/* Icon + Chip */}
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

                    {/* Title + Description */}
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                      {path.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                      {path.description}
                    </Typography>

                    {/* Meta */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LessonsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {path.lessons.length} Lektionen
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {path.duration}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {completed} / {path.lessons.length} abgeschlossen
                      </Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ color: path.levelColor }}>
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
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
            );
          })}
        </Grid>
      </motion.div>

      {/* Zone 3 — Detail Drawer */}
      <Drawer
        anchor="right"
        open={selectedPath !== null}
        onClose={() => setSelectedPath(null)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            bgcolor: 'background.paper',
            p: 3,
          },
        }}
      >
        {selectedPath && (
          <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${selectedPath.levelColor}1A`,
                    color: selectedPath.levelColor,
                  }}
                >
                  {selectedPath.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedPath.title}
                  </Typography>
                  <Chip
                    label={selectedPath.level}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: `${selectedPath.levelColor}1A`,
                      color: selectedPath.levelColor,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedPath(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedPath.description}
            </Typography>

            {/* Progress summary */}
            {(() => {
              const completed = selectedPath.lessons.filter((l) => l.completed).length;
              const progress = (completed / selectedPath.lessons.length) * 100;
              return (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Fortschritt
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: selectedPath.levelColor }}>
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(145,158,171,0.16)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: selectedPath.levelColor,
                      },
                    }}
                  />
                </Box>
              );
            })()}

            {/* Lesson list */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Lektionen ({selectedPath.lessons.length})
            </Typography>
            <List disablePadding>
              {selectedPath.lessons.map((lesson, idx) => (
                <ListItem
                  key={idx}
                  onClick={() => navigate(`/learn/${selectedPath.slug}/${lesson.slug}`)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: 'pointer',
                    bgcolor: lesson.completed ? 'rgba(0,167,111,0.08)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(145,158,171,0.08)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {lesson.completed ? (
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    ) : (
                      <UncheckedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={lesson.title}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: lesson.completed ? 600 : 400,
                      sx: {
                        textDecoration: lesson.completed ? 'line-through' : 'none',
                        color: lesson.completed ? 'text.secondary' : 'text.primary',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Drawer>
    </motion.div>
  );
}
