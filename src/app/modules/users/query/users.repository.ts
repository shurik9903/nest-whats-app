import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/database/mongodb/schemas/User.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async insert(data: User): Promise<User | undefined> {
    const newUser = new this.userModel(data);
    return newUser.save();
  }

  async update(data: User): Promise<User | undefined> {
    return this.userModel.findByIdAndUpdate(data._id, data);
  }

  async getById(id: string): Promise<User | undefined> {
    return await this.userModel.findById(id).populate('otp').exec();
  }

  async getByPhone(phoneNumber: string): Promise<User | undefined> {
    return this.userModel.findOne({ phoneNumber }).populate('otp').exec();
  }

  async updateRefreshTokenById(
    id: string,
    token: string,
  ): Promise<User | undefined> {
    const user = await this.userModel
      .findByIdAndUpdate(id, {
        refreshToken: token,
      })
      .exec();

    if (!user) {
      return undefined;
    }

    return user;
  }

  async updateRefreshTokenByPhone(
    phone: string,
    token: string,
  ): Promise<User | undefined> {
    const user = await this.userModel
      .findOneAndUpdate({ phoneNumber: phone }, { refreshToken: token })
      .exec();

    if (!user) {
      return undefined;
    }

    return user;
  }
}
