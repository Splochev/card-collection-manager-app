import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { ScrapeService } from './scrape.service';
import { ScrapeController } from './scrape.controller';
import { CardsModule } from '../cards/cards.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CardsModule, WebsocketModule],
  controllers: [ScrapeController],
  providers: [ScrapeService],
  exports: [ScrapeService],
})
export class ScrapeModule {}
