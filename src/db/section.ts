import { supabase } from "./client";
import { Section, BookletDetailResponse } from "@/api/index.d";
import { Logger } from '@/utils/logger';

// 插入小册的所有章节
export async function insertBookletSections(bookletDetail: BookletDetailResponse) {
  try {
    const { introduction, sections } = bookletDetail.data;

    // 1. 插入介绍章节
    await insertSection(introduction);
    console.log(`- 插入介绍章节成功`);

    // 2. 插入所有章节
    for (const section of sections) {
      await insertSection(section);
    }
    console.log(`- 插入 ${sections.length} 个章节成功`);

  } catch (error) {
    console.error('插入小册章节失败:', error);
    throw error;
  }
}

// 插入单个章节
async function insertSection(section: Section) {
  try {
    // 1. 插入章节基本信息
    const { error: sectionError } = await supabase
      .from('sections')
      .upsert(
        {
          id: section.id,
          section_id: section.section_id,
          title: section.title,
          user_id: section.user_id,
          booklet_id: section.booklet_id,
          status: section.status,
          content: section.content,
          draft_content: section.draft_content,
          draft_title: section.draft_title,
          markdown_content: section.markdown_content,
          markdown_show: section.markdown_show,
          is_free: section.is_free,
          read_time: section.read_time,
          read_count: section.read_count,
          comment_count: section.comment_count,
          ctime: section.ctime,
          mtime: section.mtime,
          is_update: section.is_update,
          draft_read_time: section.draft_read_time,
          vid: section.vid,
          app_html_content: section.app_html_content,
          edit_times: section.edit_times
        },
        {
          onConflict: 'section_id',
          ignoreDuplicates: false
        }
      );

    if (sectionError) {
      Logger.error(`插入/更新章节失败 [${section.title}]`, sectionError);
      throw sectionError;
    }

    Logger.success('sections.log', `章节 [${section.title}] 更新成功`);

    // 2. 如果有阅读进度，插入或更新阅读进度
    if (section.reading_progress) {
      const { error: progressError } = await supabase
        .from('section_reading_progress')
        .upsert(
          {
            booklet_id: section.reading_progress.booklet_id,
            user_id: section.reading_progress.user_id,
            section_id: section.reading_progress.section_id,
            reading_end: section.reading_progress.reading_end,
            reading_progress: section.reading_progress.reading_progress,
            reading_position: section.reading_progress.reading_position,
            has_update: section.reading_progress.has_update,
            last_rtime: section.reading_progress.last_rtime,
            ctime: section.reading_progress.ctime,
            mtime: section.reading_progress.mtime
          },
          {
            onConflict: 'booklet_id,user_id,section_id',
            ignoreDuplicates: false
          }
        );

      if (progressError) {
        Logger.error(`更新阅读进度失败 [${section.title}]`, progressError);
        throw progressError;
      }

      Logger.success('reading_progress.log', `章节 [${section.title}] 阅读进度更新成功`);
    }
  } catch (error) {
    Logger.error(`处理章节失败 [${section.title}]`, error);
    throw error;
  }
}

// 获取小册的所有章节
export async function getBookletSections(bookletId: string) {
  const { data, error } = await supabase
    .from('sections')
    .select(`
      *,
      section_reading_progress (*)
    `)
    .eq('booklet_id', bookletId)
    .order('ctime', { ascending: true });

  if (error) {
    console.error('获取小册章节失败:', error);
    throw error;
  }

  return data;
}

// 获取单个章节详情
export async function getSectionById(sectionId: string) {
  const { data, error } = await supabase
    .from('sections')
    .select(`
      *,
      section_reading_progress (*)
    `)
    .eq('section_id', sectionId)
    .single();

  if (error) {
    console.error('获取章节详情失败:', error);
    throw error;
  }

  return data;
} 