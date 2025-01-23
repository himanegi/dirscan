import { Injectable } from '@nestjs/common';
import { performance } from 'perf_hooks';
import * as workerpool from 'workerpool';
import { join } from 'path';

@Injectable()
export class ScanService {
  private pool: workerpool.Pool;

  constructor() {
    this.pool = workerpool.pool(join(__dirname, 'scan-worker'), {
      maxWorkers: 5,
    });
  }

  async scanWithWorker(dirPath: string) {
    try {
      return await this.pool.exec('scanDirectory', [{ dirPath }]);
    } catch (error) {
      console.error('Worker error:', error);
      throw error;
    }
  }

  async scanParallel(dirPath: string) {
    const results = await this.scanWithWorker(dirPath);
    const subDirResults = await Promise.all(
      results
        .filter((file) => file.isDirectory)
        .map((dir) => this.scanParallel(dir.filePath)),
    );

    return results.concat(...subDirResults);
  }

  async scanDir() {
    const rootDir = 'test-dir';
    const startTime = performance.now();

    const scanResults = await this.scanParallel(rootDir);
    const endTime = performance.now();
    console.log(`Parallel scan took ${endTime - startTime}ms`);

    return scanResults.flat();
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.terminate();
    }
  }
}
