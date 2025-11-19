import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { SubscriberUserRepository } from '../../subscriber-users/repositories/subscriber-user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriberUserRepository: SubscriberUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.subscriberUserRepository.findOne({ where: { id: payload.sub } as any });
    if (!user) throw new UnauthorizedException('Invalid token');
    if (user.status !== 'active' || user.is_locked) throw new UnauthorizedException('User not active or locked');

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      subscriberId: user.subscriber_id,
    } as TokenPayload;
  }
}
