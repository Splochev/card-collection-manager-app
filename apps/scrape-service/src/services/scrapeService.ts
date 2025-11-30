import puppeteer, { Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import axios, { AxiosResponse } from 'axios';
import { AppDataSource } from '../db';
import { CardEditions } from '../entities/card-editions.entity';
import { CardEntity } from '../entities/card.entity';
import {
  sanitizeCardSetCode,
  sanitizeCollectionName,
  validateUrl,
} from '../utils/validation.utils';
import { IsNull, In } from 'typeorm';
import {
  RARITIES,
  ICard,
  CardDto,
  ScrapeCardDto,
  CardApiResponse,
  CardQueryDto,
  SKIP_URLS,
} from '@card-collection-manager-app/shared';

function formatCardData(card: ICard, cardQuery: CardQueryDto): CardDto {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id,
    name,
    type,
    desc,
    race,
    imageUrl,
    typeline,
    atk,
    def,
    level,
    attribute,
    linkval,
    linkmarkers,
    pend_desc,
    monster_desc,
    scale,
    humanReadableCardType,
    frameType,
    archetype,
    ...rest
  } = card;

  const parsedCard = {
    name,
    type,
    desc,
    race,
    imageUrl:
      imageUrl ||
      (rest['card_images'] as { image_url?: string }[] | undefined)?.[0]
        ?.image_url,
    typeline,
    atk,
    def,
    level,
    attribute,
    linkval,
    linkmarkers,
    pend_desc,
    monster_desc,
    scale,
    humanReadableCardType,
    frameType,
    archetype,
    cardId: cardQuery.id,
    cardSet: cardQuery.cardSet,
    cardSetNames: cardQuery.cardSetNames || [],
  };

  return parsedCard as unknown as CardDto;
}

async function upsertCardsFromSet(cardSetName: string) {
  const response: AxiosResponse<CardApiResponse> = await axios.get(
    `https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${encodeURIComponent(
      cardSetName,
    )}`,
  );

  const placeHolders: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];

  response.data.data.map((card: ICard) => {
    const formattedCard = formatCardData(card, {
      cardSet: cardSetName,
      id: card.id.toString(),
      cardSetNames: [cardSetName],
    });

    values.push(
      formattedCard.name,
      formattedCard.cardSetNames,
      formattedCard.type,
      formattedCard.desc,
      formattedCard.race,
      formattedCard.cardId,
      formattedCard.imageUrl,
      formattedCard.typeline,
      formattedCard.atk,
      formattedCard.def,
      formattedCard.level,
      formattedCard.attribute,
      formattedCard.linkval,
      formattedCard.linkmarkers,
      formattedCard.pend_desc,
      formattedCard.monster_desc,
      formattedCard.scale,
      formattedCard.humanReadableCardType,
      formattedCard.frameType,
      formattedCard.archetype,
    );

    placeHolders.push(
      `($${values.length - 19}, $${values.length - 18}, $${values.length - 17}, $${values.length - 16}, $${values.length - 15}, $${values.length - 14}, $${values.length - 13}, $${values.length - 12}, $${values.length - 11}, $${values.length - 10}, $${values.length - 9}, $${values.length - 8}, $${values.length - 7}, $${values.length - 6}, $${values.length - 5}, $${values.length - 4}, $${values.length - 3}, $${values.length - 2}, $${values.length - 1}, $${values.length})`,
    );
  });

  values.push(cardSetName);

  await AppDataSource.query(
    `
      INSERT INTO "cards" ("name", "cardSetNames", "type", "desc", "race", "cardId", "imageUrl", "typeline", "atk", "def", "level", "attribute", "linkval", "linkmarkers", "pend_desc", "monster_desc", "scale", "humanReadableCardType", "frameType", "archetype")
      VALUES ${placeHolders.join(', ')}
      ON CONFLICT ("name") DO UPDATE
        SET "cardSetNames" = array_append("cards"."cardSetNames", $${values.length})
    `,
    values,
  );
}

export async function saveCards(
  collectionName: string,
  cards: ScrapeCardDto[],
) {
  const missingCards: ScrapeCardDto[] = [];

  try {
    await upsertCardsFromSet(collectionName);
    const names = cards.map((card) => card.Name);
    const cardRepository = AppDataSource.getRepository(CardEntity);
    const cardsFromDb = await cardRepository.find({
      where: { name: In(names) },
      order: { name: 'ASC' },
    });

    const cardsMap: Record<string, number> = {};
    cardsFromDb.forEach((card) => {
      cardsMap[card.name] = card.id;
    });

    const cardEditions: CardEditions[] = [];
    cards.forEach((cardEdition) => {
      let rarity = cardEdition['Rarity'] || '';

      const rarities: string[] = [];
      const sortedRarities = RARITIES.sort((a, b) => b.length - a.length);
      for (const _rarity of sortedRarities) {
        if ((rarity || '').includes(_rarity)) {
          rarities.push(_rarity);
          rarity = rarity.replace(_rarity, '').trim();
        }
      }

      const obj = {
        cardNumber: cardEdition['Card Number'] || cardEdition['Set number'],
        cardSetName: cardEdition['Collection Name'],
        name: cardEdition['Name'],
        cardId: cardsMap[cardEdition['Name']],
        rarities,
      } as CardEditions;

      if (
        !obj.cardNumber ||
        !obj.cardSetName ||
        !obj.name ||
        !obj.rarities?.length ||
        !obj.cardId
      ) {
        missingCards.push(cardEdition);
        return;
      }

      cardEditions.push(obj);
    });

    const cardEditionsRepository = AppDataSource.getRepository(CardEditions);
    await cardEditionsRepository
      .createQueryBuilder()
      .insert()
      .into(CardEditions)
      .values(cardEditions)
      .orIgnore()
      .execute();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (
      !e?.response?.data?.error &&
      typeof !e?.response?.data?.error === 'string' &&
      !e?.response?.data?.error?.includes('No card matching your query')
    ) {
      const collectionNameWithNoSpecialChars = collectionName.replace(
        /[^\w\s]/gi,
        '',
      );
      // TODO FIX PATH
      // C:\Users\Stani\work\card-collection-manager-app\apps\scrape-service\src
      const seedFilePath = path.join(
        __dirname,
        `../../../../src/logs/${collectionNameWithNoSpecialChars}.json`,
      );

      fs.writeFileSync(
        seedFilePath,
        JSON.stringify({
          collectionName,
          error: JSON.stringify(e, null, 2),
          cards: cards.map((card) => ({
            name: card.Name,
            cardNumber: card['Card Number'],
          })),
        }),
      );
    }
  }

  if (missingCards.length) {
    // TODO FIX PATH
    // C:\Users\Stani\work\card-collection-manager-app\apps\scrape-service\src
    const seedFilePath = path.join(
      __dirname,
      `../../../../src/logs/missingCards.json`,
    );

    let existingData: ScrapeCardDto[] = [];
    if (fs.existsSync(seedFilePath)) {
      const fileContent = fs.readFileSync(seedFilePath, 'utf-8');
      try {
        existingData = JSON.parse(fileContent);
      } catch {
        existingData = [];
      }
    }

    const updatedData = [...existingData, ...missingCards];
    fs.writeFileSync(seedFilePath, JSON.stringify(updatedData, null, 2));
  }
}

export async function scrapeCardCollection(
  collectionName: string,
  failedExtractions: Set<string>,
) {
  // Sanitize inputs
  const sanitizedCollectionName = sanitizeCollectionName(collectionName);
  const urlCollectionName = sanitizedCollectionName.replace(/ /g, '_');
  const url = `https://yugioh.fandom.com/wiki/${urlCollectionName}`;

  // Validate URL before using it
  validateUrl(url, 'yugioh.fandom.com');

  if (SKIP_URLS[url]) {
    console.log(`Skipping ${collectionName} as it is in the skip list.`);
    return;
  }

  failedExtractions.add(url);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 180000 });

  const tableHtml = await page.evaluate(() => {
    //@ts-ignore
    const table = document.querySelector('table.sortable');
    return table ? table.outerHTML : null;
  });

  if (!tableHtml) {
    console.error(`No table found on the page for ${collectionName}.`);
    await browser.close();
    return;
  }

  const $c = cheerio.load(tableHtml);

  const headers: string[] = [];
  const rows: Record<string, string>[] = [];

  $c('tr').each((rowIdx, row) => {
    const cells = $c(row).find('th, td');
    const rowData: string[] = [];

    cells.each((cellIdx, cell) => {
      rowData.push($c(cell).text().trim());
    });

    if (rowIdx === 0) {
      headers.push(...rowData);
      const index = headers.findIndex((h) => {
        const lowerCaseHeader = h.toLowerCase();
        return (
          lowerCaseHeader === 'card number' || lowerCaseHeader === 'set number'
        );
      });

      if (index !== -1) {
        headers[index] = 'Card Number';
      } else {
        throw new Error(
          `Expected header "Card Number" or "Set Number" not found in ${collectionName}`,
        );
      }

      headers.push('Collection Name');
    } else {
      const rowObject: Record<string, string> = {
        'Collection Name': collectionName,
      };
      rowData.forEach((val, i) => {
        val = val.replace(/"/g, '').trim();
        val = val.replace(/\s*\(.*?\)\s*/g, '').trim();

        rowObject[headers[i] || `col${i}`] = val;
      });
      rows.push(rowObject);
    }
  });

  await browser.close();

  await saveCards(collectionName, rows as unknown as ScrapeCardDto[]);

  console.log(`Scraped ${collectionName} successfully!`);
  failedExtractions.delete(url);
}

export async function scrapeCards(collectionNames: string[]): Promise<void> {
  console.log('Scraping started...');
  // delete everything from folder logs
  // TODO FIX PATH from C:\Users\Stani\work\card-collection-manager-app\apps\scrape-service\dist\src\logs
  // to  C:\Users\Stani\work\card-collection-manager-app\apps\scrape-service\src 
  const logsPath = path.join(__dirname, `../../../../src/logs`);
  fs.rmSync(logsPath, { recursive: true, force: true });
  fs.mkdirSync(logsPath, { recursive: true });

  const namesToScrape = [...collectionNames].reverse();
  const failedExtractions: Set<string> = new Set();
  while (namesToScrape.length) {
    const collectionName = namesToScrape.pop() || '';
    try {
      await scrapeCardCollection(collectionName, failedExtractions);
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toUpperCase() : String(error);
      if (
        message.includes('ERR_SOCKET_NOT_CONNECTED') ||
        message.includes('ERR_CONNECTION_CLOSED') ||
        message.includes('ERR_CERT_VERIFIER_CHANGED') ||
        message.includes('ERR_NAME_NOT_RESOLVED')
      ) {
        namesToScrape.push(collectionName);
        await new Promise((r) => setTimeout(r, 20000));
      } else {
        console.error(`Error scraping ${collectionName}:`, error);
      }
    }
  }

  if (failedExtractions.size) {
    const seedFilePath = path.join(
      __dirname,
      // TODO FIX PATH
      // C:\Users\Stani\work\card-collection-manager-app\apps\scrape-service\src
      `../../../../src/logs/scrape.status.json`,
    );

    fs.writeFileSync(seedFilePath, JSON.stringify(failedExtractions, null, 2));
    console.log('Scrape completed...');
  }
}

export async function getMarketplaceUrl(
  cardSetCode: string,
  browser?: Browser,
): Promise<string> {
  const shouldCloseBrowser = !browser;
  let page;

  try {
    // Sanitize card set code
    const sanitizedCardSetCode = sanitizeCardSetCode(cardSetCode);

    const editionRepo = AppDataSource.getRepository(CardEditions);
    const cardEdition = (
      await editionRepo.find({ where: { cardNumber: sanitizedCardSetCode } })
    )[0];

    if (cardEdition?.marketURL) {
      return cardEdition.marketURL;
    }

    const url = `https://www.cardmarket.com/en/YuGiOh`;

    // Validate URL before using it
    validateUrl(url, 'cardmarket.com');

    // Use provided browser or create new one
    if (!browser) {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    page = await browser.newPage();

    // Set a timeout for the entire page to prevent hanging
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Increased delay to ensure page is fully stable
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.waitForSelector('#ProductSearchInput', {
      visible: true,
      timeout: 20000,
    });

    await page.type('#ProductSearchInput', sanitizedCardSetCode, {
      delay: 50, // Add delay between keystrokes to prevent issues
    });

    // Increased delay before clicking/submitting
    await new Promise((resolve) => setTimeout(resolve, 500));

    const searchButton = await page.$('#search-btn');
    if (searchButton) {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        }),
        searchButton.click(),
      ]);
    } else {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        }),
        page.keyboard.press('Enter'),
      ]);
    }

    const currentUrl = page.url();
    const parsedURL = currentUrl + `?language=1&minCondition=4`;
    await editionRepo.update(
      { cardNumber: sanitizedCardSetCode },
      { marketURL: parsedURL },
    );

    return parsedURL;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `Error getting marketplace URL for ${cardSetCode}:`,
      errorMessage,
    );
    throw new Error(`Card not found: ${errorMessage}`);
  } finally {
    // Always close the page if it was created
    if (page) {
      try {
        await page.close();
      } catch {
        // Ignore errors when closing page
      }
    }

    if (shouldCloseBrowser && browser) {
      try {
        await browser.close();
      } catch {
        // Ignore errors when closing browser
      }
    }
  }
}

export async function migrateMarketURLs(): Promise<void> {
  const editionRepo = AppDataSource.getRepository(CardEditions);
  const allCardEditions = await editionRepo.find({
    where: { marketURL: IsNull() },
  });

  console.log(`Processing ${allCardEditions.length} card editions...`);

  // Launch a single browser instance for all operations
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Overcome limited resource problems
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  try {
    const skips: string[] = [];
    // Optimized batch size for stability
    const BATCH_SIZE = 3; // Process 3 cards concurrently (balanced speed/stability)
    const MAX_RETRIES = 2; // Reduced retries to fail faster
    const editionsToProcess = allCardEditions.filter(
      (edition) =>
        !edition.marketURL &&
        edition.cardNumber &&
        !skips.includes(edition.cardNumber.split('-')[0]),
    );

    let successCount = 0;
    let failureCount = 0;
    const failedCards: string[] = [];

    for (let i = 0; i < editionsToProcess.length; i += BATCH_SIZE) {
      const batch = editionsToProcess.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(editionsToProcess.length / BATCH_SIZE)} (${i + 1}-${Math.min(i + BATCH_SIZE, editionsToProcess.length)} of ${editionsToProcess.length}) | Success: ${successCount} | Failed: ${failureCount}`,
      );

      // Process batch concurrently with retry logic
      const results = await Promise.allSettled(
        batch.map(async (edition) => {
          let lastError: unknown;

          // Retry logic for failed requests
          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
              await getMarketplaceUrl(edition.cardNumber, browser);
              console.log(`✓ Updated market URL for ${edition.cardNumber}`);
              return { success: true, cardNumber: edition.cardNumber };
            } catch (error) {
              lastError = error;

              if (attempt < MAX_RETRIES) {
                console.log(
                  `⚠ Retry ${attempt}/${MAX_RETRIES} for ${edition.cardNumber}...`,
                );
                // Wait before retrying with longer backoff
                await new Promise((resolve) =>
                  setTimeout(resolve, 2000 * attempt),
                );
              }
            }
          }

          // All retries failed
          const errorMessage =
            lastError instanceof Error ? lastError.message : String(lastError);
          console.error(
            `✗ Failed to update market URL for ${edition.cardNumber} after ${MAX_RETRIES} attempts:`,
            errorMessage,
          );
          failedCards.push(edition.cardNumber);
          return { success: false, cardNumber: edition.cardNumber };
        }),
      );

      // Count successes and failures
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          failureCount++;
        }
      });

      // Longer delay between batches to prevent rate limiting and allow browser to recover
      if (i + BATCH_SIZE < editionsToProcess.length) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.log(
      `\n=== Migration completed! ===\nTotal: ${editionsToProcess.length} | Success: ${successCount} | Failed: ${failureCount}`,
    );

    if (failedCards.length > 0) {
      console.log(
        `\nFailed cards (${failedCards.length}): ${failedCards.slice(0, 20).join(', ')}${failedCards.length > 20 ? '...' : ''}`,
      );
    }
  } finally {
    await browser.close();
  }
}
