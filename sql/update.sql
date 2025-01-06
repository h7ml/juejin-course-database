-- 更新外键约束为 CASCADE
DO $$ 
BEGIN
    -- 1. 先删除现有的外键约束
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

    -- 2. 重新添加带 CASCADE 的外键约束
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

    ALTER TABLE section_contents 
    ADD CONSTRAINT section_contents_section_id_fkey 
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE,
    ADD CONSTRAINT section_contents_booklet_id_fkey 
    FOREIGN KEY (booklet_id) REFERENCES booklets(booklet_id) ON DELETE CASCADE;

END $$; 