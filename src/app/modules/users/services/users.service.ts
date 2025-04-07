import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../query/users.repository';
import { User } from 'src/database/mongodb/schemas/User.schema';
import { ResourceNotFoundException } from 'src/core/exceptions/ResourceNotFoundException';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async insert(data: User): Promise<User> {
    return await this.usersRepository.insert(data);
  }

  async update(id: string, data: User): Promise<User> {
    const user: User = await this.usersRepository.update(id, data);

    if (user === undefined) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async getById(id: string): Promise<User> {
    const user: User = await this.usersRepository.getById(id);

    if (user === undefined) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async getByPhone(phoneNumber: string): Promise<User> {
    const user: User = await this.usersRepository.getByPhone(phoneNumber);

    if (user === undefined) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async updateRefreshTokenById(id: string, token: string): Promise<User> {
    const user: User | undefined =
      await this.usersRepository.updateRefreshTokenById(id, token);
    if (user === undefined) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async updateRefreshTokenByPhone(phone: string, token: string): Promise<User> {
    const user: User | undefined =
      await this.usersRepository.updateRefreshTokenByPhone(phone, token);
    if (user === undefined) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }
}
