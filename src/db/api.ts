import { supabase } from './client';
import { Booklet, Section } from './index.d';

// 获取sql booklets 表中的 booklet_id 集合
export function getBooklet(): Promise<Booklet[]> {
  return new Promise((resolve, reject) => {
    supabase
      .from('booklets')
      .select('booklet_id,title')
      .then(({ data, error }) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
  });
}

// 分页获取所有章节
export async function getAllSections(): Promise<Section[]> {
  const pageSize = 1000;
  let allSections: Section[] = [];
  let lastId = 0;

  while (true) {
    const { data, error } = await supabase
      .from('sections')
      .select('id,section_id,title')
      .gt('id', lastId)
      .order('id', { ascending: true })
      .limit(pageSize);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allSections = allSections.concat(data);
    lastId = data[data.length - 1].id;

    console.log(`- 已获取 ${allSections.length} 条记录`);

    if (data.length < pageSize) {
      break;
    }
  }

  return allSections;
}

// 按小册ID获取章节
export async function getSectionsByBookletId(bookletId: string): Promise<Section[]> {
  const pageSize = 1000;
  let allSections: Section[] = [];
  let lastId = 0;

  while (true) {
    const { data, error } = await supabase
      .from('sections')
      .select('id,section_id,title')
      .eq('booklet_id', bookletId)
      .gt('id', lastId)
      .order('id', { ascending: true })
      .limit(pageSize);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allSections = allSections.concat(data);
    lastId = data[data.length - 1].id;

    if (data.length < pageSize) {
      break;
    }
  }

  return allSections;
}

// 修改原有的 getSection 函数
export function getSection(booklet_id?: string): Promise<Section[]> {
  return booklet_id ? getSectionsByBookletId(booklet_id) : getAllSections();
}

