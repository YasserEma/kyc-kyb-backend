import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from 'src/modules/user/enums/user-status.enum';
import { UserService } from 'src/modules/user/user.service';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const { userId } = payload;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked');
    }

    return user;
  }
}
