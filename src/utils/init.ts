import fs from 'fs';
import path from 'path';
import { Logger } from './logger';

export function initDirectories() {
  const dirs = [
    '.log',
    'booklets'
  ];

  try {
    // 确保每个必要的目录都存在
    dirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        Logger.log('init.log', `创建目录: ${dir}`);
        console.log(`创建目录: ${dir}`);
      }
    });

    Logger.success('init.log', '目录初始化完成');
    console.log('目录初始化完成');
  } catch (error) {
    Logger.error('目录初始化失败', error);
    console.error('目录初始化失败:', error);
    throw error;
  }
} 