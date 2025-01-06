import fs from 'fs';
import path from 'path';

const writeLog = process.env.NEXT_PUBLIC_WRITE_LOG === 'true';
const writeFile = process.env.NEXT_PUBLIC_WRITE_FILE === 'true';

export class Logger {
  private static logDir = path.join(process.cwd(), '.log');

  private static ensureLogDir() {
    if (writeFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  static log(filename: string, message: string) {
    this.ensureLogDir();
    const timestamp = new Date().toISOString();
    const logPath = path.join(this.logDir, filename);
    if (writeLog) {
      fs.appendFileSync(logPath, `${timestamp} - ${message}\n`);
    }
  }

  static error(message: string, error: any) {
    this.log('error.log', `${message}: ${JSON.stringify(error, null, 2)}`);
  }

  static success(filename: string, message: string) {
    this.log(filename, `✓ ${message}`);
  }
} 