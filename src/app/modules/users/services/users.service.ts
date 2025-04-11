import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../query/users.repository';
import { User } from 'src/database/mongodb/schemas/User.schema';
import { ResourceNotFoundException } from 'src/core/exceptions/ResourceNotFound.exception';
import { UploadService } from '../../upload/services/upload.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly uploadService: UploadService,
  ) {}

  async insert(data: User): Promise<User> {
    return await this.usersRepository.insert(data);
  }

  async update(data: User): Promise<User> {
    const user: User = await this.usersRepository.update(data);

    if (user === null) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async getById(id: string): Promise<User> {
    const user: User = await this.usersRepository.getById(id);

    if (user === null) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async getByPhone(phoneNumber: string): Promise<User> {
    const user: User = await this.usersRepository.getByPhone(phoneNumber);

    if (user === null) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async updateRefreshTokenById(id: string, token: string): Promise<User> {
    const user: User | undefined =
      await this.usersRepository.updateRefreshTokenById(id, token);
    if (user === null) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async updateRefreshTokenByPhone(phone: string, token: string): Promise<User> {
    const user: User | undefined =
      await this.usersRepository.updateRefreshTokenByPhone(phone, token);
    if (user === null) {
      throw new ResourceNotFoundException('User not found');
    }
    return user;
  }

  async profileUpload(data: User, file: Express.Multer.File) {
    const saveFileUUID: string = await this.uploadService.upload(
      String(data._id),
      file,
    );

    data.profilePic = saveFileUUID;

    const user: User = await this.usersRepository.update(data);

    if (user === null) {
      throw new ResourceNotFoundException('User not found');
    }
  }
}
