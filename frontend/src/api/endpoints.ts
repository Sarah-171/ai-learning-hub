import client from './client';

export const getPaths = () => client.get('paths/');

export const getPath = (slug: string) => client.get(`paths/${slug}/`);

export const getLesson = (slug: string) => client.get(`lessons/${slug}/`);

export const completeLesson = (slug: string) => client.post(`lessons/${slug}/complete/`);

export const sendChatMessage = (message: string, lessonId?: number) =>
  client.post('chat/', { message, lesson_id: lessonId ?? null });

export const getProfile = () => client.get('profile/');

export const getLeaderboard = () => client.get('leaderboard/');

export const getAchievements = () => client.get('achievements/');
