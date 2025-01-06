import axios from 'axios';
import { BookletResponse, SectionResponse, BookletDetailResponse } from './index.d';

export async function getBookletShelfList(): Promise<BookletResponse> {
  const url = 'https://api.juejin.cn/booklet_api/v1/booklet/bookletshelflist';

  const headers = {
    cookie: process.env.JUEJIN_COOKIE
  };

  const params = {
    aid: '2608',
    uuid: '7386542801419060790',
    spider: '0'
  };

  try {
    const response = await axios.post<BookletResponse>(url, {}, {
      headers,
      params,
    });
    return response.data;
  } catch (error) {
    console.error('获取小册列表失败:', error);
    throw error;
  }
}

export async function getSectionContent(sectionId: string): Promise<SectionResponse> {
  const url = 'https://api.juejin.cn/booklet_api/v1/section/get';

  const headers = {
    cookie: process.env.JUEJIN_COOKIE
  };

  const params = {
    aid: '2608',
    uuid: '7386542801419060790',
    spider: '0'
  };

  const data = {
    section_id: sectionId
  };

  try {
    const response = await axios.post<SectionResponse>(url, data, {
      headers,
      params
    });
    return response.data;
  } catch (error) {
    console.error('获取章节内容失败:', error);
    throw error;
  }
}

// 获取小册详情
export async function getBookletDetail(bookletId: string): Promise<BookletDetailResponse> {
  const url = 'https://api.juejin.cn/booklet_api/v1/booklet/get';

  const headers = {
    cookie: process.env.JUEJIN_COOKIE
  };

  const params = {
    aid: '2608',
    uuid: '7386542801419060790',
    spider: '0'
  };

  const data = {
    booklet_id: bookletId
  };

  try {
    const response = await axios.post<BookletDetailResponse>(url, data, {
      headers,
      params
    });
    return response.data;
  } catch (error) {
    console.error('获取小册详情失败:', error);
    throw error;
  }
}
