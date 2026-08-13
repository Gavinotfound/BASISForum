export type User = {
  id: string;
  name?: string | null;
  username?: string | null;
  email: string;
  emailVerified?: string | null;
  image?: string | null;
  reputation_score: number;
  role: 'student' | 'moderator' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Thread = {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  subject: string;
  is_sticky: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type Resource = {
  id: string;
  thread_id: string;
  parent_id?: string;
  author_id: string;
  content: string;
  is_thread_starter: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
};

export type ModerationLog = {
  id: string;
  moderator_id: string;
  target_type: 'thread' | 'post' | 'user';
  target_id: string;
  action: string;
  reason?: string;
  created_at: string;
};
