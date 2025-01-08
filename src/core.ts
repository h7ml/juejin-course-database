import { getBookletShelfList, getBookletDetail, getSectionContent } from "@/api";
import { insertBookletData, insertBookletSections, insertSectionContent } from "@/db";
import type { Booklet, Section } from "@/db";
import { Logger } from "@/utils/logger";
import fs from 'fs';
import path from 'path';

const writeLog = process.env.NEXT_PUBLIC_WRITE_LOG === 'true';
const writeFile = process.env.NEXT_PUBLIC_WRITE_FILE === 'true';
//  获取小册列表
async function getBookletList() {
  const response = await getBookletShelfList();
  if (response.err_no === 0) {
    await insertBookletData(response.data);
    if (writeLog) Logger.success('booklet_list.log', '数据写入成功');
    console.log('数据写入成功!');
  } else {
    if (writeLog) Logger.error('获取小册列表失败', response.err_msg);
    console.error('获取数据失败:', response.err_msg);
  }
}

// 获取小册详情并保存
async function getBookDetails(booklets: Booklet[]) {
  if (writeLog) Logger.log('booklet_details.log', `开始获取小册详情: 共 ${booklets.length} 本`);
  console.log(`开始获取小册详情: 共 ${booklets.length} 本`);

  // 遍历获取每本小册的详情
  for (const [index, { booklet_id, title }] of booklets.entries()) {
    try {
      if (writeLog) Logger.log('booklet_details.log', `[${index + 1}/${booklets.length}] 正在获取: ${title}`);
      console.log(`[${index + 1}/${booklets.length}] 正在获取: ${title}`);

      // 获取小册详情
      const response = await getBookletDetail(booklet_id);

      // 保存到数据库
      await insertBookletSections(response);
      console.log(`- 保存到数据库成功`);

      // 保存到文件
      if (writeFile) {
        const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_');
        const filePath = path.join(process.cwd(), 'booklets', `${safeTitle}.json`);
        await fs.promises.writeFile(
          filePath,
          JSON.stringify(response, null, 2),
          'utf-8'
        );
        console.log(`- 保存到文件成功`);
      }

      // 添加延时，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 记录到日志文件
      if (writeLog) {
        const logPath = path.join(process.cwd(), '.log', 'booklet_details.log');
        fs.appendFileSync(logPath, `处理小册 ${title} 成功\n`);
        Logger.success('booklet_details.log', `处理小册 ${title} 成功`);
      }

    } catch (error) {
      if (writeLog) Logger.error(`处理小册 ${title} 失败`, error);
      console.error(`处理小册 ${title} 失败:`, error);
      // 记录到日志文件
      if (writeLog) {
        const logPath = path.join(process.cwd(), '.log', 'error.log');
        fs.appendFileSync(logPath, `处理小册 ${title} 失败: ${error}\n`);
      }
    }
  }

  if (writeLog) Logger.success('booklet_details.log', '所有小册处理完成');
  console.log('所有小册处理完成！');
}

// 获取小册章节
async function sectionContent(sections: Section[], type: 'update' | 'insert' = 'insert') {
  if (writeLog) Logger.log('section_content.log', `开始获取章节内容: 共 ${sections.length} 个章节`);
  console.log(`开始获取章节内容: 共 ${sections.length} 个章节`);

  // 按每批 50 个章节处理，避免并发请求过多
  const batchSize = 50;
  for (let i = 0; i < sections.length; i += batchSize) {
    const batch = sections.slice(i, i + batchSize);
    console.log(`处理第 ${i + 1} 到 ${Math.min(i + batchSize, sections.length)} 个章节`);

    for (const section of batch) {
      try {
        if (writeLog) Logger.log('section_content.log', `正在获取: ${section.title}`);
        console.log(`正在获取: ${section.title}`);

        // 获取章节内容
        const response = await getSectionContent(section.section_id);
        if (response) {
          // 保存到数据库
          if (type === 'insert' || (type === 'update' && response.data.markdown_content)) {
            await insertSectionContent(response);
            console.log(`- 保存到数据库成功`);
            // 保存到文件
            if (writeFile) {
              const filePath = path.join(process.cwd(), 'booklets', `${section.section_id}.json`);
              await fs.promises.writeFile(
                filePath,
                JSON.stringify(response, null, 2),
                'utf-8'
              );
              console.log(`- 保存到文件成功`);
            }
          } else {
            console.log(`章节内容为空: ${section.title}`);
          }

          // 添加短暂延时
          await new Promise(resolve => setTimeout(resolve, 200));

          // 记录到日志文件
          if (writeLog) {
            const logPath = path.join(process.cwd(), '.log', 'section_content.log');
            fs.appendFileSync(logPath, `处理章节 ${section.title} 成功\n`);
            Logger.success('section_content.log', `处理章节 ${section.title} 成功`);
          }
          continue;
        } else {
          console.log(`获取章节内容失败: ${section.title} 章节内容为空`);
          continue;
        }

      } catch (error) {
        if (writeLog) Logger.error(`处理章节 ${section.title} 失败`, error);
        console.error(`处理章节 ${section.title} 失败:`, error);
        // 记录到日志文件
        if (writeLog) {
          const logPath = path.join(process.cwd(), '.log', 'error.log');
          fs.appendFileSync(logPath, `处理章节 ${section.title} 失败: ${error}\n`);
        }
      }
    }

    // 每批处理完后添加较长延时
    if (i + batchSize < sections.length) {
      if (writeLog) Logger.log('section_content.log', '批次处理完成，等待下一批...');
      console.log('批次处理完成，等待下一批...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (writeLog) Logger.success('section_content.log', '所有章节处理完成');
  console.log('所有章节处理完成！');
}

export { getBookletList, getBookDetails, sectionContent };