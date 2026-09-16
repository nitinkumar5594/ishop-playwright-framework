import * as fs from 'fs';
import * as path from 'path';

export class TestDataHelper {
  static loadJsonData<T>(relativePath: string): T {
    const fullPath = path.resolve(process.cwd(), relativePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as T;
  }
}
