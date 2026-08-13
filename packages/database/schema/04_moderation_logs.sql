-- Moderation Logs Table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id UUID REFERENCES public.users(id),
    target_type TEXT NOT NULL, -- 'thread', 'post', 'user'
    target_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'delete', 'ban', 'warn', 'sticky'
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
