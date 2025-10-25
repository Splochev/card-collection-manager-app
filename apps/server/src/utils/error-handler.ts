import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

interface DatabaseError {
  code: string | number;
  message: string;
  detail?: string;
  table?: string;
  column?: string;
  constraint?: string;
  schema?: string;
  file?: string;
  line?: string;
  routine?: string;
}

export function handleDatabaseError(err: unknown): void {
  if (err instanceof Error && 'code' in err && 'detail' in err) {
    const dbErr = err as DatabaseError;
    console.error(`Database error occurred: ${dbErr.message}`, dbErr);

    switch (Number(dbErr.code)) {
      case 23505: // Unique violation
        throw new ConflictException(
          dbErr.detail || 'A unique constraint was violated.',
          { cause: err },
        );
      case 23503: // Foreign key violation
        throw new BadRequestException(
          dbErr.detail || 'A foreign key constraint was violated.',
          { cause: err },
        );
      case 22001: // String data, right truncation
        throw new BadRequestException(
          dbErr.detail || 'String data is too long for the column.',
          { cause: err },
        );
      case 23514: // Check constraint violation
        throw new BadRequestException(
          dbErr.detail || 'A check constraint was violated.',
          { cause: err },
        );
      default:
        throw new InternalServerErrorException(
          dbErr.message || 'An unexpected database error occurred.',
          { cause: err },
        );
    }
  } else {
    console.error('An unknown error occurred', err);
    throw new InternalServerErrorException('An unknown error occurred.', {
      cause: err,
    });
  }
}
