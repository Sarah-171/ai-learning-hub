import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: number | string;
  suffix?: string;
  color: string;
}

function useCountUp(target: number, duration = 400) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

export default function StatCard({ icon, title, value, suffix, color }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : null;
  const animatedValue = useCountUp(numericValue ?? 0);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <Card
        sx={{
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 32px -4px ${color}33`,
          },
        }}
      >
        {/* Radial gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            transform: 'translate(30%, -30%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}1A`,
              color,
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
          {numericValue !== null ? animatedValue : value}
          {suffix && (
            <Typography component="span" variant="h5" sx={{ ml: 0.5, color: 'text.secondary' }}>
              {suffix}
            </Typography>
          )}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Card>
    </motion.div>
  );
}
