import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  islogin(): string {
    return 'ola authservice!';
  }
}
