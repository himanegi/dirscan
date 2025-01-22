import { Controller, Post } from '@nestjs/common';
import { ScanService } from './scan.service';

@Controller('scan')
export class ScanController {
  constructor(private scanService: ScanService) {}

  @Post()
  async scanDir() {
    await this.scanService.scanDir();
    // await this.scanService.scanDirSync();
  }
}
