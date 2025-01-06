import { supabase } from './client';
import { Logger } from '@/utils/logger';

// 检查表是否存在
async function checkTableExists(tableName: string) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    Logger.error(`检查表 ${tableName} 失败`, error);
    return false;
  }
  return data;
}

// 初始化数据库函数
export async function initDatabase() {
  Logger.log('database.log', '开始检查数据库表');
  console.log('开始检查数据库表...');

  // 更新表列表，包含所有需要的表
  const tables = [
    'users',
    'booklets',
    'user_growth',
    'reading_progress',
    'sections',
    'section_reading_progress',
    'section_contents'
  ];

  for (const table of tables) {
    const exists = await checkTableExists(table);
    if (!exists) {
      const msg = `表 ${table} 不存在，需要创建`;
      Logger.error('数据库初始化失败', msg);
      console.log(msg);
      return false;
    }
  }

  Logger.success('database.log', '所有表都已存在');
  console.log('所有表都已存在');
  return true;
}

// 数据库操作函数
export async function insertBookletData(data: any[]) {
  console.log('开始插入/更新数据...');
  Logger.log('course.log', '开始插入/更新数据');

  // 确保数据库表已创建
  const isInitialized = await initDatabase();
  if (!isInitialized) {
    const msg = '数据库未初始化，请先创建表';
    Logger.error('数据库初始化失败', msg);
    throw new Error(msg);
  }

  try {
    // 收集所有用户ID和小册ID
    const userIds = new Set();
    const bookletIds = new Set();
    data.forEach(item => {
      userIds.add(item.user_info.user_id);
      bookletIds.add(item.booklet_id);
      if (item.reading_progress?.user_id) {
        userIds.add(item.reading_progress.user_id);
      }
    });

    Logger.log('course.log', `收集到 ${userIds.size} 个用户ID, ${bookletIds.size} 个小册ID`);

    // 3. 插入用户数据
    console.log('插入用户数据...');
    Logger.log('course.log', '开始插入用户数据');
    const userMap = new Map();
    data.forEach(item => {
      // 添加小册作者的用户信息
      userMap.set(item.user_info.user_id, {
        user_id: item.user_info.user_id,
        user_name: item.user_info.user_name,
        company: item.user_info.company,
        job_title: item.user_info.job_title,
        avatar_large: item.user_info.avatar_large,
        level: item.user_info.level,
        description: item.user_info.description,
        followee_count: item.user_info.followee_count,
        follower_count: item.user_info.follower_count,
        post_article_count: item.user_info.post_article_count,
        got_digg_count: item.user_info.got_digg_count,
        got_view_count: item.user_info.got_view_count,
        power: item.user_info.power,
        is_vip: item.user_info.is_vip
      });

      // 添加阅读进度中的用户信息（如果有）
      if (item.reading_progress?.user_id) {
        // 如果这个用户还没有被添加过
        if (!userMap.has(item.reading_progress.user_id)) {
          userMap.set(item.reading_progress.user_id, {
            user_id: item.reading_progress.user_id,
            user_name: '未知用户',  // 设置默认值
            company: '',
            job_title: '',
            avatar_large: '',
            level: 0,
            description: '',
            followee_count: 0,
            follower_count: 0,
            post_article_count: 0,
            got_digg_count: 0,
            got_view_count: 0,
            power: 0,
            is_vip: false
          });
        }
      }
    });
    const users = Array.from(userMap.values());
    const { error: usersError } = await supabase
      .from('users')
      .upsert(users, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (usersError) {
      Logger.error('插入用户数据失败', usersError);
      throw new Error(`插入用户数据失败: ${usersError.message}`);
    }
    Logger.success('course.log', '用户数据更新完成');

    // 4. 插入小册数据
    console.log('插入小册数据...');
    Logger.log('course.log', '开始插入小册数据');
    const bookletMap = new Map();
    data.forEach(item => {
      bookletMap.set(item.booklet_id, {
        booklet_id: item.booklet_id,
        title: item.base_info.title,
        price: item.base_info.price,
        category_id: item.base_info.category_id,
        status: item.base_info.status,
        user_id: item.base_info.user_id,
        summary: item.base_info.summary,
        cover_img: item.base_info.cover_img,
        section_count: item.base_info.section_count,
        section_ids: item.base_info.section_ids,
        is_finished: item.base_info.is_finished,
        read_time: item.base_info.read_time,
        buy_count: item.base_info.buy_count,
        background_img: item.base_info.background_img,
        is_distribution: item.base_info.is_distribution,
        commission: item.base_info.commission,
        can_vip_borrow: item.base_info.can_vip_borrow
      });
    });
    const booklets = Array.from(bookletMap.values());
    const { error: bookletsError } = await supabase
      .from('booklets')
      .upsert(booklets, {
        onConflict: 'booklet_id',
        ignoreDuplicates: false
      });

    if (bookletsError) {
      Logger.error('插入小册数据失败', bookletsError);
      throw new Error(`插入小册数据失败: ${bookletsError.message}`);
    }
    Logger.success('course.log', '小册数据更新完成');

    // 5. 插入用户成长信息
    console.log('插入用户成长信息...');
    Logger.log('course.log', '开始插入用户成长信息');
    const growthMap = new Map();
    data.forEach(item => {
      if (userIds.has(item.user_info.user_id)) {
        growthMap.set(item.user_info.user_id, {
          user_id: item.user_info.user_id,
          jpower: item.user_info.user_growth_info.jpower,
          jscore: item.user_info.user_growth_info.jscore,
          jpower_level: item.user_info.user_growth_info.jpower_level,
          jscore_level: item.user_info.user_growth_info.jscore_level,
          jscore_title: item.user_info.user_growth_info.jscore_title,
          author_achievement_list: item.user_info.user_growth_info.author_achievement_list,
          vip_level: item.user_info.user_growth_info.vip_level,
          vip_title: item.user_info.user_growth_info.vip_title
        });
      }
    });
    const userGrowthData = Array.from(growthMap.values());
    const { error: growthError } = await supabase
      .from('user_growth')
      .upsert(userGrowthData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (growthError) {
      Logger.error('插入用户成长信息失败', growthError);
      throw new Error(`插入用户成长信息失败: ${growthError.message}`);
    }
    Logger.success('course.log', '用户成长信息更新完成');

    // 6. 插入阅读进度
    console.log('插入阅读进度...');
    Logger.log('course.log', '开始插入阅读进度');
    const progressMap = new Map();
    data.forEach(item => {
      const userId = item.reading_progress.user_id;
      const bookletId = item.reading_progress.booklet_id;

      // 只有当用户ID和小册ID都存在时才插入
      if (userIds.has(userId) && bookletIds.has(bookletId)) {
        const key = `${bookletId}-${userId}`;
        progressMap.set(key, {
          booklet_id: bookletId,
          user_id: userId,
          status: item.reading_progress.status,
          buy_type: item.reading_progress.buy_type,
          reading_progress: item.reading_progress.reading_progress,
          last_section_id: item.reading_progress.last_section_id,
          has_update: item.reading_progress.has_update,
          last_rtime: item.reading_progress.last_rtime,
          valid_begin_time: item.reading_progress.valid_begin_time,
          valid_end_time: item.reading_progress.valid_end_time
        });
      }
    });

    const readingProgress = Array.from(progressMap.values());
    console.log('准备插入的阅读进度数据:', readingProgress.length);

    if (readingProgress.length > 0) {
      const { error: progressError } = await supabase
        .from('reading_progress')
        .upsert(readingProgress, {
          onConflict: 'booklet_id,user_id',
          ignoreDuplicates: false
        });

      if (progressError) {
        Logger.error('插入阅读进度失败', progressError);
        throw new Error(`插入阅读进度失败: ${progressError.message}`);
      }
      Logger.success('course.log', '阅读进度更新完成');
    } else {
      const msg = '没有有效的阅读进度数据需要插入';
      Logger.log('course.log', msg);
      console.log(msg);
      Logger.log('course.log', `用户IDs: ${Array.from(userIds).join(', ')}`);
      Logger.log('course.log', `小册IDs: ${Array.from(bookletIds).join(', ')}`);
    }

    console.log('数据插入完成');
    Logger.success('course.log', '数据更新完成');
    console.log('数据更新完成');
  } catch (error) {
    Logger.error('数据更新失败', error);
    console.error('数据更新过程中发生错误:', error);
    throw error;
  }
}

// 添加清空表内容的函数
export async function clearTables() {
  try {
    Logger.log('database.log', '开始清空表数据');
    console.log('开始清空表数据...');

    // 按照依赖关系的反序删除数据，并指定每个表的条件
    const tables = [
      { name: 'section_contents', condition: 'section_id' },
      { name: 'section_reading_progress', condition: 'section_id' },
      { name: 'sections', condition: 'section_id' },
      { name: 'reading_progress', condition: 'booklet_id' },
      { name: 'user_growth', condition: 'user_id' },
      { name: 'booklets', condition: 'booklet_id' },
      { name: 'users', condition: 'user_id' }
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table.name)
        .delete()
        .neq(table.condition, ''); // 使用空字符串作为条件，这样会匹配所有记录

      if (error) {
        Logger.error(`清空表 ${table.name} 失败`, error);
        throw new Error(`清空表 ${table.name} 失败: ${error.message}`);
      }
      Logger.success('database.log', `表 ${table.name} 已清空`);
      console.log(`表 ${table.name} 已清空`);
    }

    Logger.success('database.log', '所有表数据已清空');
    console.log('所有表数据已清空');
  } catch (error) {
    Logger.error('清空表数据失败', error);
    console.error('清空表数据失败:', error);
    throw error;
  }
}