// 基础信息接口
interface BaseInfo {
  booklet_id: string;
  title: string;
  price: number;
  category_id: string;
  status: number;
  user_id: string;
  verify_status: number;
  summary: string;
  cover_img: string;
  section_count: number;
  section_ids: string;
  is_finished: number;
  read_time: number;
  buy_count: number;
  background_img: string;
  is_distribution: number;
  distribution_img: string;
  commission: number;
  can_vip_borrow: boolean;
}

// 用户成长信息接口
interface UserGrowthInfo {
  user_id: number;
  jpower: number;
  jscore: number;
  jpower_level: number;
  jscore_level: number;
  jscore_title: string;
  author_achievement_list: number[];
  vip_level: number;
  vip_title: string;
  jscore_next_level_score: number;
  jscore_this_level_mini_score: number;
  vip_score: number;
}

// 用户信息接口
interface UserInfo {
  user_id: string;
  user_name: string;
  company: string;
  job_title: string;
  avatar_large: string;
  level: number;
  description: string;
  followee_count: number;
  follower_count: number;
  post_article_count: number;
  digg_article_count: number;
  got_digg_count: number;
  got_view_count: number;
  isfollowed: boolean;
  favorable_author: number;
  power: number;
  user_growth_info: UserGrowthInfo;
  is_vip: boolean;
}

// 阅读进度接口
interface ReadingProgress {
  booklet_id: string;
  user_id: string;
  status: number;
  buy_type: number;
  reading_progress: number;
  last_section_id: string;
  has_update: number;
  last_rtime: number;
  valid_begin_time: number;
  valid_end_time: number;
  borrow_times: number;
}

// 折扣信息接口
interface MaxDiscount {
  discount_type: number;
  discount_id: string;
  name: string;
  desc: string;
  discount_rate: number;
  price: number;
  discount_money: number;
  pay_money: number;
  is_limited_time: number;
  start_time: number;
  end_time: number;
}

// 小册信息接口
interface BookletInfo {
  booklet_id: string;
  base_info: BaseInfo;
  user_info: UserInfo;
  is_buy: boolean;
  reading_progress: ReadingProgress;
  section_updated_count: number;
  is_new: boolean;
  max_discount: MaxDiscount;
}

// API 响应接口
interface BookletResponse {
  err_no: number;
  err_msg: string;
  data: BookletInfo[];
  cursor: string;
  count: number;
  has_more: boolean;
}

// 章节阅读进度
interface SectionReadingProgress {
  id: number;
  booklet_id: string;
  user_id: string;
  section_id: string;
  reading_end: number;
  reading_progress: number;
  reading_position: number;
  has_update: number;
  last_rtime: number;
  ctime: number;
  mtime: number;
}

// 章节内容
interface Section {
  id: number;
  section_id: string;
  title: string;
  user_id: string;
  booklet_id: string;
  status: number;
  content: string;
  draft_content: string;
  draft_title: string;
  markdown_content: string;
  markdown_show: string;
  is_free: number;
  read_time: number;
  read_count: number;
  comment_count: number;
  ctime: number;
  mtime: number;
  is_update: number;
  draft_read_time: number;
  vid: string;
  app_html_content: string;
  edit_times: number;
  reading_progress: SectionReadingProgress;
}

// 章节内容响应
interface SectionResponse {
  err_no: number;
  err_msg: string;
  data: {
    section: Section;
  }
}

// 小册详情响应接口
interface BookletDetailResponse {
  err_no: number;
  err_msg: string;
  data: {
    booklet: BookletInfo;
    introduction: Section;
    sections: Section[];
  }
}

export type { BookletResponse, BookletInfo, UserInfo, UserGrowthInfo, ReadingProgress, MaxDiscount, SectionResponse, Section, SectionReadingProgress, BookletDetailResponse };