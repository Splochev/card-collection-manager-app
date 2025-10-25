import { Module } from '@nestjs/common';
import { ScrapeGateway } from './scrape.gateway';

@Module({
  providers: [ScrapeGateway],
  exports: [ScrapeGateway],
})
export class WebsocketModule {}
