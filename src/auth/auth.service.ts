/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/await-thenable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt';

export abstract class HashingService {
  abstract hash(password: string): Promise<string>;
  abstract compare(password: string, hash: string): Promise<boolean>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async login(LoginDto: LoginDto) {
    const user = await this.userService.findByEmail(LoginDto.email);
    const error = new UnauthorizedException();

    if (!user) {
      throw error;
    }

    const isPasswordValid = await this.hashingService.compare(
      LoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw error;
    }

    const JwtPayload: JwtPayload = { sub: user.id, email: user.email };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const accessToken = await this.jwtService.signAsync(JwtPayload);

    user.forceLogout = false;
    await this.userService.save(user);

    return { accessToken };
  }
}
