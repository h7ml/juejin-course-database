import { getBookletList, getBookDetails, sectionContent } from "./core";
import { getBooklet, getSection, clearTables } from "@/db";

import fs from 'fs';
import path from 'path';
import { initDirectories, Logger } from '@/utils';
const writeLog = process.env.NEXT_PUBLIC_WRITE_LOG === 'true';

async function main() {
  try {
    // 初始化目录
    initDirectories();

    const startTime = new Date();
    if (writeLog) Logger.log('program_run.log', `程序开始时间: ${startTime}`);

    // 清空所有表
    if (process.env.NEXT_PUBLIC_CLEAR_DATABASE === 'true') {
      await clearTables();
    }

    // 获取并保存小册列表
    await getBookletList();

    // 从数据库获取小册列表
    const booklets = await getBooklet();
    if (!booklets || booklets.length === 0) {
      throw new Error('没有找到小册数据');
    }

    // 获取并保存小册详情
    await getBookDetails(booklets);
    const sections = await getSection();
    if (sections && sections.length > 0) {
      await sectionContent(sections);
    }

    // 记录程序结束时间
    const endTime = new Date();
    console.log(`程序结束时间: ${endTime}`);

    // 计算程序运行时间
    const runTime = endTime.getTime() - startTime.getTime();

    const hours = Math.floor(runTime / 3600000);
    const minutes = Math.floor((runTime % 3600000) / 60000);
    const seconds = Math.floor((runTime % 60000) / 1000);
    const runTimeStr = `${hours}小时${minutes}分钟${seconds}秒`;
    console.log(`程序运行时间: ${runTimeStr}`);
    // 记录到日志文件
    if (writeLog) {
      const logPath = path.join(process.cwd(), '.log', 'program_run.log');
      fs.appendFileSync(logPath, `程序运行时间: ${runTime}ms\n`);
      Logger.success('program_run.log', `程序运行时间: ${runTimeStr}`);
    }

  } catch (error) {
    if (writeLog) Logger.error('程序执行失败', error);
    console.error('程序执行失败:', error);
  }
}

main();