import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { HashingService } from 'src/common/hashing/ hashing.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async failIfEmailExists(email: string) {
    const exitsEmail = await this.userRepository.existsBy({ email });

    if (exitsEmail) {
      throw new ConflictException('E-mail já existe');
    }
  }

  async findUserOrFail(userData: Partial<User>) {
    const hasUserData = await this.userRepository.findOneBy(userData);

    if (!hasUserData) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return hasUserData;
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findById(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashingService.hash(
      createUserDto.password,
    );

    const newUser: CreateUserDto = {
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
    };

    const created = await this.userRepository.save(newUser);
    return created;
  }

  async update(id: string, userDto: UpdateUserDto) {
    if (!userDto.name && !userDto.email) {
      throw new BadRequestException('Dados não enviados');
    }

    const user = await this.findUserOrFail({ id });

    user.name = userDto.name ?? user.name;

    if (userDto.email && userDto.email !== user.email) {
      await this.failIfEmailExists(userDto.email);
      user.email = userDto.email;
      user.forceLogout = true;
    }

    return this.save(user);
  }

  async updatePassword(id: string, userDto: UpdatePasswordDto) {
    const user = await this.findUserOrFail({ id });

    const isCurrentPasswordValid = await this.hashingService.compare(
      userDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual inválida');
    }

    user.password = await this.hashingService.hash(userDto.newPassword);
    user.forceLogout = true;

    return this.save(user);
  }

  async remove(id: string) {
    const user = await this.findUserOrFail({ id });
    await this.userRepository.delete({ id });
    return user;
  }

  save(user: User) {
    return this.userRepository.save(user);
  }
}
