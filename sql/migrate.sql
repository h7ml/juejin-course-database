-- 开始事务
BEGIN;

-- 1. 更新外键约束为 CASCADE
DO $$ 
BEGIN
    -- 删除现有的外键约束
    ALTER TABLE user_growth 
    DROP CONSTRAINT IF EXISTS user_growth_user_id_fkey;

    ALTER TABLE booklets 
    DROP CONSTRAINT IF EXISTS booklets_user_id_fkey;

    ALTER TABLE reading_progress 
    DROP CONSTRAINT IF EXISTS reading_progress_booklet_id_fkey,
    DROP CONSTRAINT IF EXISTS reading_progress_user_id_fkey;

    ALTER TABLE sections 
    DROP CONSTRAINT IF EXISTS sections_booklet_id_fkey,
    DROP CONSTRAINT IF EXISTS sections_user_id_fkey;

    ALTER TABLE section_reading_progress 
    DROP CONSTRAINT IF EXISTS section_reading_progress_booklet_id_fkey,
    DROP CONSTRAINT IF EXISTS section_reading_progress_user_id_fkey,
    DROP CONSTRAINT IF EXISTS section_reading_progress_section_id_fkey;

    ALTER TABLE section_contents 
    DROP CONSTRAINT IF EXISTS section_contents_section_id_fkey,
    DROP CONSTRAINT IF EXISTS section_contents_booklet_id_fkey;

    RAISE NOTICE '所有外键约束已删除';

    -- 重新添加带 CASCADE 的外键约束
    ALTER TABLE user_growth 
    ADD CONSTRAINT user_growth_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

    ALTER TABLE booklets 
    ADD CONSTRAINT booklets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

    ALTER TABLE reading_progress 
    ADD CONSTRAINT reading_progress_booklet_id_fkey 
    FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE,
    ADD CONSTRAINT reading_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

    ALTER TABLE sections 
    ADD CONSTRAINT sections_booklet_id_fkey 
    FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE,
    ADD CONSTRAINT sections_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

    ALTER TABLE section_reading_progress 
    ADD CONSTRAINT section_reading_progress_booklet_id_fkey 
    FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE,
    ADD CONSTRAINT section_reading_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    ADD CONSTRAINT section_reading_progress_section_id_fkey 
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE;

    RAISE NOTICE '所有外键约束已更新为 CASCADE';
END $$;

-- 2. 更新 section_contents 表结构
DO $$ 
BEGIN
    -- 删除已存在的约束和索引
    ALTER TABLE section_contents 
    DROP CONSTRAINT IF EXISTS section_contents_booklet_id_fkey;

    DROP INDEX IF EXISTS idx_section_contents_booklet_id;

    -- 添加新列
    ALTER TABLE section_contents 
    ADD COLUMN IF NOT EXISTS booklet_id TEXT,
    ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS draft_title TEXT DEFAULT '';

    -- 从 sections 表更新 booklet_id
    UPDATE section_contents sc
    SET booklet_id = s.booklet_id
    FROM sections s
    WHERE sc.section_id = s.section_id;

    -- 设置 booklet_id 为非空
    ALTER TABLE section_contents 
    ALTER COLUMN booklet_id SET NOT NULL;

    -- 删除不需要的列
    ALTER TABLE section_contents 
    DROP COLUMN IF EXISTS markdown_content;

    -- 添加索引
    CREATE INDEX IF NOT EXISTS idx_section_contents_booklet_id 
    ON section_contents(booklet_id);

    -- 添加外键约束
    ALTER TABLE section_contents 
    ADD CONSTRAINT section_contents_booklet_id_fkey 
    FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE;

    RAISE NOTICE 'section_contents 表更新完成';
END $$;

-- 提交事务
COMMIT;

RAISE NOTICE '数据库更新完成'; 