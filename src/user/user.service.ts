import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async all(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(data: Partial<User>): Promise<User> {
    return this.userRepository.save(data);
  }

  async findOne(condition: FindOptionsWhere<User>): Promise<User | null> {
    return this.userRepository.findOneBy(condition);
  }
}
