import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RacesService } from './races.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: { origin: '*', credentials: false } })
export class RacesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<
    string,
    {
      userId: string;
      username: string;
      role: string;
      raceId: string | null;
    }
  >();

  private raceTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private racesService: RacesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.connectedUsers.set(client.id, {
        userId: payload.sub,
        username: payload.username || payload.email,
        role: payload.role || 'user',
        raceId: null,
      });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user?.raceId) {
      this.server.to(user.raceId).emit('player_left', { userId: user.userId });
    }
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join_race')
  async handleJoinRace(
    @MessageBody() data: { raceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    client.join(data.raceId);
    user.raceId = data.raceId;

    if (user.role !== 'admin') {
      await this.racesService.addPlayerToRace(
        data.raceId,
        user.userId,
        user.username,
      );
    }

    const race = await this.racesService.findOne(data.raceId);
    this.server.to(data.raceId).emit('race_updated', race);
  }

  @SubscribeMessage('admin_start_race')
  async handleAdminStartRace(
    @MessageBody() data: { raceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user || user.role !== 'admin') return;

    const race = await this.racesService.findOne(data.raceId);
    if (!race || race.status !== 'waiting') return;

    await this.startCountdown(data.raceId);
  }

  @SubscribeMessage('update_progress')
  async handleUpdateProgress(
    @MessageBody()
    data: { raceId: string; progress: number; wpm: number; accuracy: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user || user.role === 'admin') return;

    const race = await this.racesService.updatePlayerProgress(
      data.raceId,
      user.userId,
      data.progress,
      data.wpm,
      data.accuracy,
    );

    this.server.to(data.raceId).emit('race_updated', race);
  }

  @SubscribeMessage('get_race')
  async handleGetRace(
    @MessageBody() data: { raceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const race = await this.racesService.findOne(data.raceId);
    client.emit('race_updated', race);
  }

  private async startCountdown(raceId: string) {
    await this.racesService.setCountdown(raceId);
    this.server.to(raceId).emit('countdown_started', { seconds: 3 });

    let seconds = 3;
    const interval = setInterval(async () => {
      seconds--;
      this.server.to(raceId).emit('countdown_tick', { seconds });

      if (seconds <= 0) {
        clearInterval(interval);
        const race = await this.racesService.startRace(raceId);
        this.server.to(raceId).emit('race_started', race);
        this.startRaceTimer(raceId);
      }
    }, 1000);
  }

  private startRaceTimer(raceId: string) {
    let timeLeft = 60;

    const interval = setInterval(async () => {
      timeLeft--;
      this.server.to(raceId).emit('timer_tick', { timeLeft });

      if (timeLeft <= 0) {
        clearInterval(interval);
        this.raceTimers.delete(raceId);
        const race = await this.racesService.finishRace(raceId);
        this.server.to(raceId).emit('race_finished', race);
      }
    }, 1000);

    this.raceTimers.set(raceId, interval);
  }
}
