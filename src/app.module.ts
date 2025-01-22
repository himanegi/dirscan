import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScanController } from './scan/scan.controller';
import { ScanService } from './scan/scan.service';
import { ScanModule } from './scan/scan.module';

@Module({
  imports: [ScanModule],
  controllers: [AppController, ScanController],
  providers: [AppService, ScanService],
})
export class AppModule {}
