import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import mongoose from 'mongoose';

@Schema({
  _id: false,
})
class OTP {
  @Prop()
  code: string;

  @Prop({ type: Date, default: () => dayjs().toDate() })
  createdAt?: Date;

  @Prop({ type: Date, default: () => dayjs().add(1, 'minute').toDate() })
  repeatAt?: Date;

  @Prop({ type: Date, default: () => dayjs().add(10, 'minute').toDate() })
  expiresAt?: Date;
}

@Schema()
export class User {
  _id?: mongoose.Types.ObjectId | string;

  @Prop({ maxlength: 100, default: null })
  username?: string;

  @Prop({ default: null })
  profilePic?: string;

  @Prop({ default: false })
  isOnline?: boolean;

  @Prop({ unique: true })
  phoneNumber: string;

  @Prop({ default: [] })
  groupId?: string[];

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ default: false })
  isPhoneVerified?: boolean;

  @Prop({ type: Date, default: () => dayjs().toDate() })
  createdAt?: Date;

  @Prop({ default: null })
  otp?: OTP;
}

export const UserSchema = SchemaFactory.createForClass(User);
