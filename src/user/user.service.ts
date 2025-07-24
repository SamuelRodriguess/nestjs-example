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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, any: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  save(user: User) {
    return this.userRepository.save(user);
  }
}
