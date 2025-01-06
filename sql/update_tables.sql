-- 更新 section_contents 表结构
DO $$ 
BEGIN
    -- 1. 删除已存在的约束和索引
    ALTER TABLE section_contents 
    DROP CONSTRAINT IF EXISTS section_contents_booklet_id_fkey;

    DROP INDEX IF EXISTS idx_section_contents_booklet_id;

    -- 2. 添加新列
    ALTER TABLE section_contents 
    ADD COLUMN IF NOT EXISTS booklet_id TEXT,
    ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS draft_title TEXT DEFAULT '';

    -- 3. 从 sections 表更新 booklet_id
    UPDATE section_contents sc
    SET booklet_id = s.booklet_id
    FROM sections s
    WHERE sc.section_id = s.section_id;

    -- 4. 设置 booklet_id 为非空
    ALTER TABLE section_contents 
    ALTER COLUMN booklet_id SET NOT NULL;

    -- 5. 删除不需要的列
    ALTER TABLE section_contents 
    DROP COLUMN IF EXISTS markdown_content;

    -- 6. 添加索引
    CREATE INDEX IF NOT EXISTS idx_section_contents_booklet_id 
    ON section_contents(booklet_id);

    -- 7. 添加外键约束
    ALTER TABLE section_contents 
    ADD CONSTRAINT section_contents_booklet_id_fkey 
    FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE;

    RAISE NOTICE 'section_contents 表更新完成';

END $$; 