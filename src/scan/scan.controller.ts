import { Controller, Get } from '@nestjs/common';
import { ScanService } from './scan.service';

@Controller('scan')
export class ScanController {
  constructor(private scanService: ScanService) {}

  @Get('dfs')
  async scanDirDFS() {
    const result = await this.scanService.scanDirDFS();
    return result;
  }
  @Get('bfs')
  async scanDirBFS() {
    const result = await this.scanService.scanDirBFS();
    return result;
  }
  @Get('sync')
  async scanDirSync() {
    const result = await this.scanService.scanDirSync();
    return result;
  }
}
