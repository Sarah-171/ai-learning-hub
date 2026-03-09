import { Card } from '@mui/material';
import { motion } from 'framer-motion';
import ChatPanel from '../components/ChatPanel';

export default function ChatPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: 'calc(100vh - 140px)' }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ChatPanel
          title="AI Tutor — Freier Chat"
          welcomeMessage="Hallo! Ich bin dein AI-Tutor. Frag mich alles über Künstliche Intelligenz, Prompt Engineering oder Agentic Workflows!"
          fullHeight
        />
      </Card>
    </motion.div>
  );
}
