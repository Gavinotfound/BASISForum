-- BASISForum complete structured-community and editorial expansion.
-- This migration is additive and may be rerun safely.

ALTER TABLE threads ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'discussion';
ALTER TABLE threads ADD COLUMN IF NOT EXISTS help_context jsonb;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_comments_closed boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now(),
  CHECK (blocker_id <> blocked_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS user_blocks_unique_pair ON user_blocks(blocker_id, blocked_id);
CREATE INDEX IF NOT EXISTS user_blocks_blocker_created_idx ON user_blocks(blocker_id, created_at);

CREATE TABLE IF NOT EXISTS report_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  appellant_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  statement text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  review_note text,
  created_at timestamp NOT NULL DEFAULT now(),
  reviewed_at timestamp
);
CREATE INDEX IF NOT EXISTS report_appeals_report_created_idx ON report_appeals(report_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS report_appeals_open_unique ON report_appeals(report_id, appellant_id) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS thread_resolutions (
  thread_id uuid PRIMARY KEY REFERENCES threads(id) ON DELETE CASCADE,
  reply_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  resolved_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  subject text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  source_thread_id uuid REFERENCES threads(id) ON DELETE SET NULL,
  source_reply_id uuid REFERENCES resources(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS knowledge_cards_subject_status_published_idx ON knowledge_cards(subject, status, published_at);
CREATE INDEX IF NOT EXISTS knowledge_cards_source_thread_idx ON knowledge_cards(source_thread_id);

CREATE TABLE IF NOT EXISTS study_hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  starts_at timestamp NOT NULL,
  ends_at timestamp NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  published_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS study_hubs_subject_status_ends_idx ON study_hubs(subject, status, ends_at);

CREATE TABLE IF NOT EXISTS study_hub_threads (
  hub_id uuid NOT NULL REFERENCES study_hubs(id) ON DELETE CASCADE,
  thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  added_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (hub_id, thread_id)
);

CREATE TABLE IF NOT EXISTS study_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  starts_at timestamp NOT NULL,
  ends_at timestamp NOT NULL,
  capacity integer NOT NULL DEFAULT 4,
  location_label text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CHECK (capacity BETWEEN 2 AND 12),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS study_circles_status_starts_idx ON study_circles(status, starts_at);
CREATE INDEX IF NOT EXISTS study_circles_host_created_idx ON study_circles(host_id, created_at);

CREATE TABLE IF NOT EXISTS study_circle_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES study_circles(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note text,
  status text NOT NULL DEFAULT 'pending',
  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  decided_at timestamp,
  UNIQUE(circle_id, requester_id)
);
CREATE INDEX IF NOT EXISTS study_circle_requests_circle_status_idx ON study_circle_requests(circle_id, status);

CREATE TABLE IF NOT EXISTS peer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL UNIQUE REFERENCES threads(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rubric jsonb NOT NULL,
  external_url text,
  status text NOT NULL DEFAULT 'open',
  closes_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS peer_review_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES peer_reviews(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  criterion text NOT NULL,
  feedback text NOT NULL,
  is_helpful boolean,
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE(review_id, reviewer_id, criterion)
);
CREATE INDEX IF NOT EXISTS peer_review_feedback_review_created_idx ON peer_review_feedback(review_id, created_at);

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  subjects jsonb NOT NULL,
  statement text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  verified_by uuid REFERENCES users(id) ON DELETE SET NULL,
  verified_at timestamp,
  expires_at timestamp,
  review_note text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mentor_profiles_status_idx ON mentor_profiles(status);

CREATE TABLE IF NOT EXISTS mentor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_profile_id uuid NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  question text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  response_note text,
  decided_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mentor_requests_mentor_status_created_idx ON mentor_requests(mentor_profile_id, status, created_at);

CREATE TABLE IF NOT EXISTS creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  display_name text NOT NULL,
  statement text NOT NULL,
  verified_by uuid REFERENCES users(id) ON DELETE SET NULL,
  verified_at timestamp,
  expires_at timestamp,
  suspension_note text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS creator_profiles_status_idx ON creator_profiles(status);

CREATE TABLE IF NOT EXISTS editorial_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  headline text NOT NULL,
  dek text NOT NULL,
  body text NOT NULL,
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_profile_id uuid REFERENCES creator_profiles(id) ON DELETE SET NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_src text,
  discussion_thread_id uuid REFERENCES threads(id) ON DELETE SET NULL,
  review_note text,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  publisher_id uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamp,
  scheduled_at timestamp,
  archived_at timestamp,
  correction_note text,
  is_sponsored boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS editorial_posts_status_published_idx ON editorial_posts(status, published_at);
CREATE INDEX IF NOT EXISTS editorial_posts_kind_status_published_idx ON editorial_posts(kind, status, published_at);
CREATE INDEX IF NOT EXISTS editorial_posts_author_created_idx ON editorial_posts(author_id, created_at);

CREATE TABLE IF NOT EXISTS editorial_post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES editorial_posts(id) ON DELETE CASCADE,
  revision_number integer NOT NULL,
  snapshot jsonb NOT NULL,
  state text NOT NULL,
  review_note text,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE(post_id, revision_number)
);
CREATE INDEX IF NOT EXISTS editorial_post_revisions_post_created_idx ON editorial_post_revisions(post_id, created_at);

CREATE TABLE IF NOT EXISTS editorial_events (
  post_id uuid PRIMARY KEY REFERENCES editorial_posts(id) ON DELETE CASCADE,
  starts_at timestamp NOT NULL,
  ends_at timestamp NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Shanghai',
  location_label text,
  registration_url text,
  capacity_note text,
  organizer_label text,
  status text NOT NULL DEFAULT 'scheduled',
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS editorial_homepage_features (
  slot text PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES editorial_posts(id) ON DELETE CASCADE,
  starts_at timestamp,
  ends_at timestamp,
  featured_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selection_note text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);
