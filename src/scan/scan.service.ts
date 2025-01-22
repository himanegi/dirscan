import { Injectable } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ScanService {
  private async scanWithWorker(dirPath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        `
        const fs = require('fs/promises');
        const path = require('path');
        const { parentPort, workerData } = require('worker_threads');
        
        async function scanDir(dirPath) {
          const files = await fs.readdir(dirPath);
          const fileDetails = await Promise.all(
            files.map(async (file) => {
              const filePath = path.join(dirPath, file);
              const stats = await fs.lstat(filePath);
        
              if (stats.isDirectory()) {
                return { file, filePath, stats, isDirectory: true };
              }
        
              return { file, filePath, stats, isDirectory: false };
            }),
          );
          return fileDetails;
        }
        
        scanDir(workerData.dirPath)
          .then((result) => parentPort.postMessage(result))
          .catch((err) => parentPort.postMessage({ error: err.message }));
      `,
        {
          eval: true,
          workerData: { dirPath },
        },
      );

      worker.on('message', (result) => {
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  private async scanDirRecursively(dirPath: string): Promise<any[]> {
    const results = await this.scanWithWorker(dirPath);
    const subDirResults = await Promise.all(
      results
        .filter((file) => file.isDirectory)
        .map((dir) => this.scanDirRecursively(dir.filePath)),
    );

    return results.concat(...subDirResults);
  }

  async scanDir() {
    const rootDir = 'test-dir';
    const startTime = performance.now();

    const scanResults = await this.scanDirRecursively(rootDir);

    const endTime = performance.now();
    console.log(`Parallelized scan took ${endTime - startTime} milliseconds`);

    return scanResults.flat();
  }

  async scanDirSync() {
    const startTime = performance.now();

    async function scanDirRecursivelySync(dirPath: string): Promise<any[]> {
      const files = await fs.readdir(dirPath);
      const results = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(dirPath, file);
          const stats = await fs.lstat(filePath);

          if (stats.isDirectory()) {
            const subDirResults = await scanDirRecursivelySync(filePath);
            return [
              { file, filePath, stats, isDirectory: true },
              ...subDirResults,
            ];
          }

          return { file, filePath, stats, isDirectory: false };
        }),
      );

      return results.flat();
    }

    const rootDir = 'test-dir';
    const scanResults = await scanDirRecursivelySync(rootDir);

    const endTime = performance.now();
    console.log(`Synchronous scan took ${endTime - startTime} milliseconds`);

    return scanResults;
  }
}
