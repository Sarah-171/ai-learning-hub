import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import { Send as SendIcon, SmartToy as SmartToyIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../api/endpoints';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  lessonId?: number;
  title?: string;
  welcomeMessage?: string;
  fullHeight?: boolean;
}

function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: 'pulse 1.4s infinite ease-in-out',
            animationDelay: `${i * 0.2}s`,
            '@keyframes pulse': {
              '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
              '40%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        />
      ))}
    </Box>
  );
}

export default function ChatPanel({
  lessonId,
  title = 'AI Tutor',
  welcomeMessage,
  fullHeight = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(
    welcomeMessage
      ? [{ role: 'assistant', content: welcomeMessage }]
      : [],
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setIsLoading(true);

    try {
      const res = await sendChatMessage(trimmed, lessonId);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch {
      setError('AI-Service nicht erreichbar. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: fullHeight ? '100%' : 'calc(100vh - 140px)',
        minHeight: 400,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(145,158,171,0.2)',
        }}
      >
        <SmartToyIcon sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        ref={scrollRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          px: 2,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  px: 2,
                  py: 1.5,
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                  color: msg.role === 'user' ? '#fff' : 'text.primary',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <Typography variant="body2">{msg.content}</Typography>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && <TypingIndicator />}

        {error && (
          <Typography variant="body2" color="error" sx={{ textAlign: 'center', mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>

      {/* Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderTop: '1px solid rgba(145,158,171,0.2)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Nachricht eingeben..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          multiline
          maxRows={3}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
