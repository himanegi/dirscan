import { promises as fs } from 'fs';
import * as path from 'path';
import * as workerpool from 'workerpool';

export async function scanDirectory({ dirPath }: { dirPath: string }) {
  try {
    const files = await fs.readdir(dirPath);

    const fileDetails = await Promise.all(
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

    return fileDetails;
  } catch (error) {
    throw error;
  }
}

workerpool.worker({
  scanDirectory,
});
