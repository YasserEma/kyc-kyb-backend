import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SubscriberUserRepository } from '../../subscriber-users/repositories/subscriber-user.repository';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private subscriberUserRepository: SubscriberUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.subscriberUserRepository.findOne({ where: { id: payload.sub } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    if (user.is_locked) {
      throw new UnauthorizedException('User account is locked');
    }

    // Return the TokenPayload structure that the controller expects
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      subscriberId: user.subscriber_id,
    };
  }
}