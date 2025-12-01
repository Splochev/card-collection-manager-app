import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
} from '@nestjs/common';
import { sendKafkaMessage } from '../../utils/kafkaProducer';
import { JwtAuthGuard } from '../../guards/logto-jwt.guard';
import { Public } from '../../decorators/public.decorator';
import { SuperAdminPasswordGuard } from '../../guards/super-admin-password.guard';
import { SCRAPE_TOPICS } from '@card-collection-manager-app/shared';

@Controller('scrape')
export class ScrapeController {
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async migrateCardSets(
    @Body() body: { cardSetNames: string[]; cardSetCode: string },
    @Headers('x-socket-id') socketId?: string,
  ): Promise<{ message: string; status: number }> {
    await sendKafkaMessage(SCRAPE_TOPICS.SCRAPE_CARDS, {
      cardSetNames: body.cardSetNames,
      cardSetCode: body.cardSetCode,
      socketId: socketId,
    });
    return {
      message: 'Scrape job started successfully',
      status: 201,
    };
  }

  @Public()
  @UseGuards(SuperAdminPasswordGuard)
  @Get('/migrate-market-urls')
  async migrateMarketURLs(): Promise<{ message: string }> {
    await sendKafkaMessage(SCRAPE_TOPICS.MIGRATE_MARKET_URLS, {});
    return { message: 'Migration job started successfully' };
  }
}
