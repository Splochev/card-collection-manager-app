import { BadRequestException } from '@nestjs/common';

/**
 * Validates and sanitizes collection name to prevent URL injection
 */
export function sanitizeCollectionName(collectionName: string): string {
  if (!collectionName || typeof collectionName !== 'string') {
    throw new BadRequestException('Invalid collection name');
  }

  // Remove any characters that could be used for URL manipulation
  // Allow only alphanumeric, spaces, hyphens, apostrophes, parentheses, and underscores
  const sanitized = collectionName.replace(/[^a-zA-Z0-9\s\-'()_:&!]/g, '');

  if (sanitized.length === 0) {
    throw new BadRequestException(
      'Collection name contains only invalid characters',
    );
  }

  return sanitized;
}

/**
 * Validates that the constructed URL is safe and targets the expected domain
 */
export function validateUrl(url: string, expectedDomain: string): void {
  try {
    const parsedUrl = new URL(url);

    // Ensure the URL uses HTTPS
    if (parsedUrl.protocol !== 'https:') {
      throw new BadRequestException('Only HTTPS URLs are allowed');
    }

    // Ensure the domain matches expected domain
    if (!parsedUrl.hostname.endsWith(expectedDomain)) {
      throw new BadRequestException(
        `Invalid domain. Expected ${expectedDomain}`,
      );
    }

    // Prevent localhost, private IPs, etc.
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname === '::1' ||
      hostname === '0.0.0.0'
    ) {
      throw new BadRequestException(
        'Access to private networks is not allowed',
      );
    }
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Invalid URL format');
  }
}

/**
 * Validates card set code to prevent injection attacks
 */
export function sanitizeCardSetCode(cardSetCode: string): string {
  if (!cardSetCode || typeof cardSetCode !== 'string') {
    throw new BadRequestException('Invalid card set code');
  }

  // Card set codes should only contain alphanumeric characters and hyphens
  const sanitized = cardSetCode.replace(/[^a-zA-Z0-9-]/g, '');

  if (sanitized.length === 0) {
    throw new BadRequestException(
      'Card set code contains only invalid characters',
    );
  }

  return sanitized;
}
