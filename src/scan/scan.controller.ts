import { Controller, Get } from '@nestjs/common';
import { ScanService } from './scan.service';

@Controller('scan')
export class ScanController {
  constructor(private scanService: ScanService) {}

  @Get()
  async scanDir() {
    const result = await this.scanService.scanDir();
    return result;
  }
}
