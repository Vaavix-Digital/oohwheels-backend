-- ============================================================================
-- OohWheels Neon PostgreSQL Full Database Schema
-- Run this in your Neon Console (https://console.neon.tech) -> SQL Editor
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(128) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32),
  password_hash VARCHAR(255),
  role VARCHAR(32) DEFAULT 'user',
  avatar VARCHAR(64) DEFAULT 'red-car',
  country_code VARCHAR(8) DEFAULT 'GB',
  streak_current INT DEFAULT 7,
  gems INT DEFAULT 85,
  xp INT DEFAULT 2150,
  daily_goal_xp INT DEFAULT 50,
  hearts INT DEFAULT 5,
  is_premium BOOLEAN DEFAULT FALSE,
  firebase_uid VARCHAR(128),
  password_reset_token VARCHAR(128),
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Questions Table (Stores DVSA Driving Theory Bank)
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(128) PRIMARY KEY,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(8) NOT NULL,
  explanation TEXT,
  category VARCHAR(128) DEFAULT 'Road Signs',
  topic_key VARCHAR(64) DEFAULT 'road-signs',
  difficulty VARCHAR(32) DEFAULT 'easy',
  image_url TEXT,
  video_url TEXT,
  video_thumbnail_url TEXT,
  has_video BOOLEAN DEFAULT FALSE,
  country_code VARCHAR(8) DEFAULT 'GB',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_topic_key ON questions(topic_key);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

-- 3. Flash Signs Table (UK Highway Code Flashcards)
CREATE TABLE IF NOT EXISTS flash_signs (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  meaning TEXT NOT NULL,
  category VARCHAR(64) NOT NULL,
  shape VARCHAR(64) DEFAULT 'circle',
  image_url TEXT,
  country_code VARCHAR(8) DEFAULT 'GB',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flash_signs_category ON flash_signs(category);

-- 4. Videos Table (Hazard Perception & Video Animation Clips)
CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT DEFAULT 45,
  topic_key VARCHAR(64) DEFAULT 'road-signs',
  country_code VARCHAR(8) DEFAULT 'GB',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_topic ON videos(topic_key);

-- 5. Practice Topics Table (Core Syllabus & Audio Rules)
CREATE TABLE IF NOT EXISTS practice_topics (
  key VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  tag VARCHAR(64),
  rule_text TEXT,
  audio_url TEXT,
  xp_reward INT DEFAULT 30,
  total_questions INT DEFAULT 10,
  country_code VARCHAR(8) DEFAULT 'GB'
);
