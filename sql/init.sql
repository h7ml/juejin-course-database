-- 开始事务
BEGIN;

-- 用户表：存储用户基本信息
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  company TEXT,
  job_title TEXT,
  avatar_large TEXT,
  level INTEGER DEFAULT 0,
  description TEXT,
  followee_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  post_article_count INTEGER DEFAULT 0,
  got_digg_count INTEGER DEFAULT 0,
  got_view_count INTEGER DEFAULT 0,
  power INTEGER DEFAULT 0,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 用户成长信息表：存储用户的成长数据，如掘力值、掘分等
CREATE TABLE IF NOT EXISTS user_growth (
  user_id TEXT PRIMARY KEY,
  jpower INTEGER DEFAULT 0,
  jscore INTEGER DEFAULT 0,
  jpower_level INTEGER DEFAULT 0,
  jscore_level INTEGER DEFAULT 0,
  jscore_title TEXT,
  author_achievement_list TEXT[],
  vip_level INTEGER DEFAULT 0,
  vip_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 小册表：存储小册的基本信息
CREATE TABLE IF NOT EXISTS booklets (
  booklet_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  category_id TEXT,
  status INTEGER DEFAULT 1,
  user_id TEXT,
  summary TEXT,
  cover_img TEXT,
  section_count INTEGER DEFAULT 0,
  section_ids TEXT[],
  is_finished BOOLEAN DEFAULT false,
  read_time INTEGER DEFAULT 0,
  buy_count INTEGER DEFAULT 0,
  background_img TEXT,
  is_distribution BOOLEAN DEFAULT false,
  commission INTEGER DEFAULT 0,
  can_vip_borrow BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 阅读进度表：存储用户对小册的阅读进度
CREATE TABLE IF NOT EXISTS reading_progress (
  booklet_id TEXT,
  user_id TEXT,
  status INTEGER DEFAULT 1,
  buy_type INTEGER DEFAULT 0,
  reading_progress INTEGER DEFAULT 0,
  last_section_id TEXT,
  has_update INTEGER DEFAULT 0,
  last_rtime BIGINT,
  valid_begin_time BIGINT DEFAULT 0,
  valid_end_time BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  PRIMARY KEY (booklet_id, user_id),
  FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 章节表：存储小册的章节信息
CREATE TABLE IF NOT EXISTS sections (
  id TEXT,
  section_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  booklet_id TEXT,
  user_id TEXT,
  status INTEGER DEFAULT 1,
  content TEXT,
  draft_content TEXT,
  draft_title TEXT,
  markdown_show TEXT,
  markdown_content TEXT,
  is_free BOOLEAN DEFAULT false,
  read_time INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  ctime BIGINT,
  mtime BIGINT,
  is_update BOOLEAN DEFAULT false,
  draft_read_time INTEGER DEFAULT 0,
  vid TEXT,
  app_html_content TEXT,
  edit_times INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 章节阅读进度表：存储用户对具体章节的阅读进度
CREATE TABLE IF NOT EXISTS section_reading_progress (
  booklet_id TEXT,
  user_id TEXT,
  section_id TEXT,
  reading_end INTEGER DEFAULT 0,
  reading_progress INTEGER DEFAULT 0,
  reading_position INTEGER DEFAULT 0,
  has_update INTEGER DEFAULT 0,
  last_rtime BIGINT,
  ctime BIGINT,
  mtime BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  PRIMARY KEY (booklet_id, user_id, section_id),
  FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE
);

-- 章节内容表：存储章节的具体内容
CREATE TABLE IF NOT EXISTS section_contents (
  section_id TEXT PRIMARY KEY,
  booklet_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status INTEGER DEFAULT 1,
  draft_title TEXT DEFAULT '',
  markdown_show TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE,
  FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_booklets_user_id ON booklets(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_booklet_id ON sections(booklet_id);
CREATE INDEX IF NOT EXISTS idx_section_contents_booklet_id ON section_contents(booklet_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_section_reading_progress_user_id ON section_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_section_reading_progress_section_id ON section_reading_progress(section_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
DO $$ 
BEGIN
    -- 删除已存在的触发器（如果有）
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS update_user_growth_updated_at ON user_growth;
    DROP TRIGGER IF EXISTS update_booklets_updated_at ON booklets;
    DROP TRIGGER IF EXISTS update_reading_progress_updated_at ON reading_progress;
    DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
    DROP TRIGGER IF EXISTS update_section_reading_progress_updated_at ON section_reading_progress;
    DROP TRIGGER IF EXISTS update_section_contents_updated_at ON section_contents;

    -- 创建新的触发器
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_growth_updated_at
        BEFORE UPDATE ON user_growth
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_booklets_updated_at
        BEFORE UPDATE ON booklets
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_reading_progress_updated_at
        BEFORE UPDATE ON reading_progress
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_sections_updated_at
        BEFORE UPDATE ON sections
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_section_reading_progress_updated_at
        BEFORE UPDATE ON section_reading_progress
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_section_contents_updated_at
        BEFORE UPDATE ON section_contents
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;

COMMIT;

RAISE NOTICE '数据库初始化完成'; 