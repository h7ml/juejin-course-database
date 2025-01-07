// 定义返回类型
export type Booklet = {
  booklet_id: string;
  title: string;
};

export type Section = {
  id: string;
  section_id: string;
  title: string;
};

export type SectionEmpty = Booklet & Section & {
  id: string;
  content: string;
};
