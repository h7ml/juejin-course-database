import { getSectionContentEmpty } from "@/db";
import { getBookletShelfList } from "@/api";
import { sectionContent } from "./core";
import { Logger } from "@/utils";
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
    console.log(`共计${sectionContentEmpty.length}个空章节内容`);
    // 查询所有的 sections 
    const { data = [] } = await getBookletShelfList();

    // 筛选出过期的 VIP 借阅
    const expiredVipBorrows = data.filter((item: any) => {
      // 检查是否有 VIP 借阅并且是否过期
      return item.is_buy === false && item.base_info.is_distribution && item.base_info.price > 0;
    });
    // 使用 lodash 过滤掉 sectionContentEmpty 中 与 expiredVipBorrows booklet_id 相同的
    // 过滤 sectionContentEmpty，去除与过期借阅相同 booklet_id 的内容
    const sectionContentEmptyFilter = sectionContentEmpty.filter((item: any) => {
      // 先排除过期 VIP 借阅项
      const isNotExpiredBorrow = !expiredVipBorrows.some((borrow: any) => borrow.base_info.booklet_id === item.booklet_id);

      // 保留在 data 中的 booklet_id
      const isInData = data.some((borrow: any) => borrow.base_info.booklet_id === item.booklet_id);

      // 只有同时符合两者条件才保留
      return isNotExpiredBorrow && isInData;
    });

    console.log(`共计${sectionContentEmptyFilter.length}个空章节内容 需要更新`);
    await sectionContent(sectionContentEmptyFilter, 'update');
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
