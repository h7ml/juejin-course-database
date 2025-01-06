import { supabase } from "./client";
import { SectionResponse } from "@/api/index.d";
import { Logger } from "@/utils/logger";

// 插入章节内容
export async function insertSectionContent(sectionResponse: SectionResponse) {
  try {
    const { section } = sectionResponse.data;

    const { error } = await supabase
      .from('section_contents')
      .upsert(
        {
          section_id: section.section_id,
          booklet_id: section.booklet_id,
          title: section.title,
          content: section.content,
          status: section.status,
          draft_title: section.draft_title || '',
          markdown_show: section.markdown_show
        },
        {
          onConflict: 'section_id',
          ignoreDuplicates: false
        }
      );

    if (error) throw error;

  } catch (error) {
    Logger.error(`更新章节内容失败 [${sectionResponse.data.section.title}]`, error);
    throw error;
  }
}

// 获取章节内容
export async function getSectionContent(sectionId: string) {
  const { data, error } = await supabase
    .from('section_contents')
    .select('section_id,booklet_id,title,content,status,draft_title,markdown_show')
    .eq('section_id', sectionId)
    .single();

  if (error) {
    Logger.error('获取章节内容失败:', error);
    return null;
  }

  return data;
}

// 批量插入章节内容
export async function batchInsertSectionContents(sections: SectionResponse[]) {
  try {
    const contents = sections.map(response => ({
      section_id: response.data.section.section_id,
      booklet_id: response.data.section.booklet_id,
      title: response.data.section.title,
      content: response.data.section.content,
      status: response.data.section.status,
      draft_title: response.data.section.draft_title || '',
      markdown_show: response.data.section.markdown_show
    }));

    const { error } = await supabase
      .from('section_contents')
      .upsert(contents, {
        onConflict: 'section_id',
        ignoreDuplicates: false
      });

    if (error) throw error;

  } catch (error) {
    Logger.error('批量更新章节内容失败:', error);
    throw error;
  }
}

// 按小册ID获取所有章节内容
export async function getSectionContentsByBookletId(bookletId: string) {
  const { data, error } = await supabase
    .from('section_contents')
    .select('section_id,booklet_id,title,content,status,draft_title,markdown_show')
    .eq('booklet_id', bookletId)
    .order('section_id', { ascending: true });

  if (error) {
    Logger.error(`获取小册 ${bookletId} 的章节内容失败`, error);
    return null;
  }

  return data;
}

// 按小册ID批量获取章节内容
export async function batchGetSectionContentsByBookletIds(bookletIds: string[]) {
  const { data, error } = await supabase
    .from('section_contents')
    .select('section_id,booklet_id,title,content,status,draft_title,markdown_show')
    .in('booklet_id', bookletIds)
    .order('booklet_id', { ascending: true })
    .order('section_id', { ascending: true });

  if (error) {
    Logger.error('批量获取章节内容失败', error);
    return null;
  }

  return data;
} 