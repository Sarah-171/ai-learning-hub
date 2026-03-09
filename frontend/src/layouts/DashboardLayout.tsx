import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Leaderboard as LeaderboardIcon,
  EmojiEvents as AchievementsIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED = 72;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Lernpfade', icon: <SchoolIcon />, path: '/learn' },
  { label: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard' },
  { label: 'Achievements', icon: <AchievementsIcon />, path: '/achievements' },
  { label: 'AI Chat', icon: <ChatIcon />, path: '/chat' },
  { label: 'Profil', icon: <PersonIcon />, path: '/profile' },
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const width = open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width,
            transition: 'width 0.2s',
            overflowX: 'hidden',
            bgcolor: 'background.paper',
            borderRight: '1px dashed rgba(145,158,171,0.2)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {open && (
            <Typography variant="h6" fontWeight={700} noWrap>
              AI Learning Hub
            </Typography>
          )}
          <IconButton onClick={() => setOpen(!open)} sx={{ ml: 'auto' }}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        <List sx={{ px: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'rgba(0,167,111,0.16)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.label} />}
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(22,28,36,0.8)',
            backdropFilter: 'blur(6px)',
            borderBottom: '1px dashed rgba(145,158,171,0.2)',
          }}
        >
          <Toolbar sx={{ minHeight: 64 }} />
        </AppBar>

        {/* Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
