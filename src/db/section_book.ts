import { supabase } from "./client";
import { Section, SectionReadingProgress } from "../api";

// 插入章节内容
export async function insertSection(section: Section) {
  const { error } = await supabase
    .from('sections')
    .upsert({
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
    });

  if (error) {
    console.error('插入章节内容失败:', error);
    throw error;
  }

  // 插入阅读进度
  if (section.reading_progress) {
    await insertSectionReadingProgress(section.reading_progress);
  }
}

// 插入章节阅读进度
export async function insertSectionReadingProgress(progress: SectionReadingProgress) {
  const { error } = await supabase
    .from('section_reading_progress')
    .upsert({
      booklet_id: progress.booklet_id,
      user_id: progress.user_id,
      section_id: progress.section_id,
      reading_end: progress.reading_end,
      reading_progress: progress.reading_progress,
      reading_position: progress.reading_position,
      has_update: progress.has_update,
      last_rtime: progress.last_rtime,
      ctime: progress.ctime,
      mtime: progress.mtime
    });

  if (error) {
    console.error('插入章节阅读进度失败:', error);
    throw error;
  }
}

// 根据章节ID获取章节内容
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
    console.error('获取章节内容失败:', error);
    return null;
  }

  return data;
}

// 根据小册ID获取所有章节
export async function getSectionsByBookId(bookletId: string) {
  const { data, error } = await supabase
    .from('sections')
    .select(`
      *,
      section_reading_progress (*)
    `)
    .eq('booklet_id', bookletId);

  if (error) {
    console.error('获取小册章节列表失败:', error);
    return null;
  }

  return data;
}