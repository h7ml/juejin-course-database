-- 按照依赖关系的反序删除数据
DO $$ 
BEGIN
    -- 禁用外键约束
    SET CONSTRAINTS ALL DEFERRED;

    -- 清空表数据
    TRUNCATE TABLE section_contents CASCADE;
    TRUNCATE TABLE section_reading_progress CASCADE;
    TRUNCATE TABLE sections CASCADE;
    TRUNCATE TABLE reading_progress CASCADE;
    TRUNCATE TABLE user_growth CASCADE;
    TRUNCATE TABLE booklets CASCADE;
    TRUNCATE TABLE users CASCADE;

    -- 启用外键约束
    SET CONSTRAINTS ALL IMMEDIATE;
END $$; 