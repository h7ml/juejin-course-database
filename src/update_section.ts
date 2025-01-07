import { getSectionContentEmpty, getBooklet } from "@/db";
import { getBookletShelfList } from "@/api";
import { sectionContent } from "./core";
import { Logger } from "@/utils";
import fs from 'fs';
const writeLog = process.env.NEXT_PUBLIC_WRITE_LOG === 'true';

const main = async () => {
  const startTime = new Date();
  if (writeLog) Logger.log('program_run.log', `程序开始时间: ${startTime}`);

  const sectionContentEmpty = await getSectionContentEmpty();
  if (sectionContentEmpty.length === 0) {
    console.log('没有空章节内容');
    return;
  }
  else {
    // fs.writeFileSync('./booklets/section_content_empty.json', JSON.stringify(sectionContentEmpty, null, 2));
    console.log(`共计${sectionContentEmpty.length}个空章节内容`);
    // 查询所有的 sections 
    const { data = [] } = await getBookletShelfList();
    // fs.writeFileSync('./booklets/sections.json', JSON.stringify(data, null, 2));

    // 筛选出过期的 VIP 借阅
    const expiredVipBorrows = data.filter((item: any) => {
      // 检查是否有 VIP 借阅并且是否过期
      return item.is_buy === false && item.base_info.is_distribution && item.base_info.price > 0;
    });
    // 使用 lodash 过滤掉 sectionContentEmpty 中 与 expiredVipBorrows booklet_id 相同的
    const sectionContentEmptyFilter = sectionContentEmpty.filter((item: any) => {
      return !expiredVipBorrows.some((borrow: any) => borrow.base_info.booklet_id === item.booklet_id);
    });
    // fs.writeFileSync('./booklets/section_content_empty_filter.json', JSON.stringify(sectionContentEmptyFilter, null, 2));
    // fs.writeFileSync('./booklets/expired_vip_borrows.json', JSON.stringify(expiredVipBorrows, null, 2));
    const sectionContentEmptyFilter2 = sectionContentEmptyFilter.filter((item: any) => {
      return data.some((borrow: any) => borrow.base_info.booklet_id === item.booklet_id);
    });
    fs.writeFileSync('./booklets/section_content_empty_filter2.json', JSON.stringify(sectionContentEmptyFilter2, null, 2));
    console.log(`共计${sectionContentEmptyFilter2.length}个空章节内容 需要更新`);
    await sectionContent(sectionContentEmptyFilter2);
  }

  const endTime = new Date();
  if (writeLog) Logger.log('program_run.log', `程序结束时间: ${endTime}`);
  const runTime = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(runTime / 3600000);
  const minutes = Math.floor((runTime % 3600000) / 60000);
  const seconds = Math.floor((runTime % 60000) / 1000);
  const runTimeStr = `${hours}小时${minutes}分钟${seconds}秒`;
  Logger.log('program_run.log', `程序运行时间: ${runTimeStr}`);

}

main().then(() => {
  console.log('更新完成');
}).catch(error => {
  console.error('更新失败', error);
});
