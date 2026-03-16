import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { UsersService } from '../users/users.service';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { CardEditions } from '../../database/entities/card-editions.entity';
import { JwtAuthGuard } from '../../guards/logto-jwt.guard';
import type { IRequest } from '@card-collection-manager-app/shared';
import { User } from '../../database/entities/user.entity';
import { CardEntity } from '../../database/entities/card.entity';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly usersService: UsersService,
  ) {}
  @Get('collection/all')
  async getCollection(
    @Req() req: IRequest,
    @Query() query: CollectionQueryDto,
  ): Promise<CollectionResponseDto> {
    const user: User = await this.usersService.getUser(req);
    return this.cardsService.getCollection(
      user.id,
      query.filter,
      query.limit,
      query.offset,
      query.groupBy,
      query.orderBy,
      query.sortType,
    );
  }

  @Get('wishlist')
  async getWishlist(
    @Req() req: IRequest,
  ): Promise<(CardEntity & { total_count: number })[]> {
    const user: User = await this.usersService.getUser(req);
    return this.cardsService.getWishlist(user.id);
  }

  @Post('wishlist')
  async addCardToWishlist(
    @Req() req: IRequest,
    @Body('cardSetCode') cardSetCode: string,
    @Body('quantity') quantity: number,
  ): Promise<{ status: string; message: string }> {
    const user: User = await this.usersService.getUser(req);
    await this.cardsService.addCardToWishlist(cardSetCode, quantity, user.id);
    return {
      status: 'success',
      message: 'Card added to wishlist successfully',
    };
  }

  @Delete('wishlist')
  async removeCardFromWishlist(
    @Req() req: IRequest,
    @Body('cardSetCode') cardSetCode: string,
  ): Promise<{ status: string; message: string }> {
    const user: User = await this.usersService.getUser(req);
    await this.cardsService.removeCardFromWishlist(cardSetCode, user.id);
    return {
      status: 'success',
      message: 'Card removed from wishlist successfully',
    };
  }

  @Post('wishlist/merge')
  async mergeWishlist(
    @Req() req: IRequest,
    @Body('items') items: { name: string; count: number }[],
  ): Promise<{ status: string; message: string }> {
    const user: User = await this.usersService.getUser(req);
    await this.cardsService.mergeWishlist(items, user.id);
    return {
      status: 'success',
      message: 'Wishlist merged successfully',
    };
  }

  @Get(':cardSetCode')
  async getCardsByCardSetCode(
    @Param('cardSetCode') cardSetCode: string,
    @Req() req: IRequest,
  ): Promise<CardEditions[]> {
    const user: User = await this.usersService.getUser(req);
    return this.cardsService.getByCardSetCode(cardSetCode, user.id);
  }

  @Post()
  async addCardToCollection(
    @Req() req: IRequest,
    @Body('cardSetCode') cardSetCode: string,
    @Body('quantity') quantity: number,
  ): Promise<{ status: string; message: string }> {
    const user: User = await this.usersService.getUser(req);
    await this.cardsService.addCardToCollection(cardSetCode, quantity, user.id);
    return {
      status: 'success',
      message: 'Card added to collection successfully',
    };
  }
}
