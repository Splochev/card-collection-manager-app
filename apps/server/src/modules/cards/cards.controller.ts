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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { UsersService } from '../users/users.service';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { CardEditions } from '../../database/entities/card-editions.entity';
import { JwtAuthGuard } from '../../guards/logto-jwt.guard';
import type { IRequest } from '@card-collection-manager-app/shared';
import { User } from '../../database/entities/user.entity';

@ApiTags('cards')
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly usersService: UsersService,
  ) {}
  @ApiOperation({ summary: 'Get cards by card set code' })
  @ApiResponse({
    status: 200,
    description: 'Cards retrieved successfully',
    type: CardEditions,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Card set not found' })
  @Get(':cardSetCode')
  async getCardsByCardSetCode(
    @Param('cardSetCode') cardSetCode: string,
    @Req() req: IRequest,
  ): Promise<CardEditions[]> {
    const user: User = await this.usersService.getUser(req);
    return this.cardsService.getByCardSetCode(cardSetCode, user.id);
  }

  @ApiOperation({ summary: 'Add card to collection and its quantity' })
  @ApiResponse({
    status: 200,
    description: 'Card added to collection successfully',
    type: CardEditions,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
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

  @ApiOperation({ summary: 'Get user collection with grouping and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Collection retrieved successfully',
    type: CollectionResponseDto,
  })
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

  @ApiOperation({ summary: 'Add card to wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Card added to wishlist successfully',
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
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

  @ApiOperation({ summary: 'Remove card from wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Card removed from wishlist successfully',
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
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
}
