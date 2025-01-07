import { getSectionContentEmpty } from "@/db/api";
import { getBookDetails } from "./core";
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
    fs.writeFileSync('./booklets/section_content_empty.json', JSON.stringify(sectionContentEmpty, null, 2));
    console.log(`共计${sectionContentEmpty.length}个空章节内容`);
    await getBookDetails(sectionContentEmpty);
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
