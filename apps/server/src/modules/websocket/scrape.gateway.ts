import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'card-manager', cors: { origin: '*' } })
export class ScrapeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ScrapeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifySearchFinished(
    payload: {
      collectionName: string;
      count?: number;
      cardSetCode?: string;
    },
    socketId?: string,
  ) {
    try {
      if (!this.server) {
        this.logger.warn('WebSocket server not initialized');
        return;
      }

      if (socketId) {
        this.logger.log(
          `Emitting searchCardSetFinished to socket ${socketId} with payload:`,
          payload,
        );
        this.server.to(socketId).emit('searchCardSetFinished', payload);
      } else {
        this.logger.warn(
          'No socketId provided, broadcasting to all clients instead',
        );
        this.server.emit('searchCardSetFinished', payload);
      }
    } catch (e) {
      this.logger.error('Error emitting searchCardSetFinished:', e);
    }
  }
}
