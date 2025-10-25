import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
} from '@nestjs/common';
import { ScrapeService } from './scrape.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/logto-jwt.guard';
import { Public } from '../../decorators/public.decorator';
import { SuperAdminPasswordGuard } from '../../guards/super-admin-password.guard';

@Controller('scrape')
export class ScrapeController {
  constructor(private readonly scrapeService: ScrapeService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new scrape job for cards' })
  @ApiResponse({ status: 201, description: 'Scrape job created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @Post('/')
  migrateCardSets(
    @Body() body: { cardSetNames: string[]; cardSetCode: string },
    @Headers('x-socket-id') socketId?: string,
  ): Promise<{ message: string; status: number }> {
    void this.scrapeService.scrapeCards(
      body.cardSetNames,
      body.cardSetCode,
      socketId,
    );
    return Promise.resolve({
      message: 'Scrape job started successfully',
      status: 201,
    });
  }

  @Public()
  @UseGuards(SuperAdminPasswordGuard)
  @Get('/migrate-market-urls')
  migrateMarketURLs(): { message: string } {
    void this.scrapeService.migrateMarketURLs();
    return { message: 'Migration job started successfully' };
  }
}
