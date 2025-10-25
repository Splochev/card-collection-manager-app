import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { WebsocketModule } from '../websocket/websocket.module';
import { UsersService } from '../users/users.service';
import { ScrapeService } from '../scrape/scrape.service';
import { CardEditions } from '../../database/entities/card-editions.entity';
import { CardEntity } from '../../database/entities/card.entity';
import { User } from '../../database/entities/user.entity';
import { UserCards } from '../../database/entities/users-cards.entity';
import { Wishlist } from '../../database/entities/wishlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardEditions,
      CardEntity,
      User,
      UserCards,
      Wishlist,
    ]),
    HttpModule,
    WebsocketModule,
  ],
  controllers: [CardsController],
  providers: [CardsService, UsersService, ScrapeService],
  exports: [CardsService],
})
export class CardsModule {}
