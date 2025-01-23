import { Injectable } from '@nestjs/common';
import { performance } from 'perf_hooks';
import * as workerpool from 'workerpool';
import { join } from 'path';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ScanService {
  private pool: workerpool.Pool;

  constructor() {
    this.pool = workerpool.pool(join(__dirname, 'scan-worker'), {
      maxWorkers: 5,
    });
  }

  async scanSync(dirPath: string): Promise<any[]> {
    const files = await fs.readdir(dirPath);
    const results = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stats = await fs.lstat(filePath);
        return {
          file,
          filePath,
          size: stats.size,
          modifiedTime: stats.mtime,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
        };
      }),
    );

    const subDirResults = await Promise.all(
      results
        .filter((file) => file.isDirectory)
        .map((dir) => this.scanSync(dir.filePath)),
    );
    return results.concat(...subDirResults);
  }

  async scanWithWorker(dirPath: string) {
    try {
      return await this.pool.exec('scanDirectory', [{ dirPath }]);
    } catch (error) {
      console.error('Worker error:', error);
      throw error;
    }
  }

  async scanParallelDFS(dirPath: string) {
    const results = await this.scanWithWorker(dirPath);
    const subDirResults = await Promise.all(
      results
        .filter((file) => file.isDirectory)
        .map((dir) => this.scanParallelDFS(dir.filePath)),
    );

    return results.concat(...subDirResults);
  }

  async scanParallelBFS(dirPath: string) {
    const queue: string[] = [dirPath];
    const allResults = [];

    while (queue.length > 0) {
      const currentDir = queue.shift();
      const results = await this.scanWithWorker(currentDir);
      allResults.push(...results);
      results
        .filter((file) => file.isDirectory)
        .forEach((dir) => queue.push(dir.filePath));
    }
    return allResults;
  }

  async scanDirSync() {
    const rootDir = 'test-dir';
    const startTime = performance.now();
    const scanResults = await this.scanSync(rootDir);
    const endTime = performance.now();
    console.log(`Sync scan took ${endTime - startTime}ms`);
    return scanResults;
  }

  async scanDirDFS() {
    const rootDir = 'test-dir';
    const startTime = performance.now();
    const scanResults = await this.scanParallelDFS(rootDir);
    const endTime = performance.now();
    console.log(`DFS scan took ${endTime - startTime}ms`);
    return scanResults.flat();
  }

  async scanDirBFS() {
    const rootDir = 'test-dir';
    const startTime = performance.now();
    const scanResults = await this.scanParallelBFS(rootDir);
    const endTime = performance.now();
    console.log(`BFS scan took ${endTime - startTime}ms`);
    return scanResults;
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.terminate();
    }
  }
}
