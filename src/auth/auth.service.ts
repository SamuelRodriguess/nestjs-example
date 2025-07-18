import { Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDTO) {
    console.log('🚀 ~ AuthService ~ login ~ loginDto:', loginDto);
    
    return 'ola authservice!';
  }
}
