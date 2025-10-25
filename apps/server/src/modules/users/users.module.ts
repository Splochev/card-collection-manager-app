import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { UserCards } from '../../database/entities/users-cards.entity';
import { Wishlist } from '../../database/entities/wishlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCards, Wishlist])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
