-- Run this in Supabase → SQL Editor → New Query
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS follower_following_ratio  float8  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_age_days          int4    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS statuses_count            int4    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS posts_per_day             float8  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS content_density           float8  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_profile_image         int2    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified                  int2    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bio_length                int4    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS username_randomness_score float8  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS username_length           int4    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fake_probability          float8  DEFAULT 0;
