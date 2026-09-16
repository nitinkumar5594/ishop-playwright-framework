export class Logger {
  static step(stepNumber: number, description: string): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] Step ${stepNumber}: ${description}`);
  }

  static info(message: string): void {
    console.log(`ℹ️ [INFO]: ${message}`);
  }

  static success(message: string): void {
    console.log(`✅ [SUCCESS]: ${message}`);
  }

  static warn(message: string): void {
    console.warn(`⚠️ [WARN]: ${message}`);
  }

  static error(message: string): void {
    console.error(`❌ [ERROR]: ${message}`);
  }
}
